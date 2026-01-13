import * as PIXI from 'pixi.js';
import { type SpineData, type BoneData, type AtlasData, type AtlasRegion, AttachmentType, type SkinData } from './SpineParser';
import { skeletonData, selectedNode, currentTool, renderingScale, addHistory } from './Store';
import { get } from 'svelte/store';

// Helper for Spine vs Pixi Rotation
const DEG_TO_RAD = Math.PI / 180;

export class SpineRenderer {
    app: PIXI.Application;
    rootContainer: PIXI.Container;
    skeletonContainer: PIXI.Container;
    gizmoContainer: PIXI.Container;

    // Slots are now managed via a container per slot
    slotContainers = new Map<string, PIXI.Container>();

    // Gizmos
    translateGizmo: PIXI.Container;
    rotateGizmo: PIXI.Container;
    scaleGizmo: PIXI.Container;

    // Assets
    baseTexture: PIXI.BaseTexture | null = null;
    atlas: AtlasData | null = null;
    regions = new Map<string, PIXI.Texture>();

    // State
    currentBone: BoneData | null = null;
    // Map of BoneName -> PIXI Container. This represents the Bone in the Viewport.
    boneContainers = new Map<string, PIXI.Container>();

    isDragging = false;
    dragType: 'translate' | 'rotate' | 'scale' | null = null;
    dragAxis: 'x' | 'y' | 'both' | null = null;
    dragStartPos = new PIXI.Point();
    boneStartTransform = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };

    constructor(canvas: HTMLCanvasElement) {
        this.app = new PIXI.Application({
            view: canvas,
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            backgroundColor: 0x111111,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        // Hierarchy: Stage -> Root -> [Slots(Z-Ordered), Skeleton(Debug), Gizmos]
        this.rootContainer = new PIXI.Container();
        this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
        this.rootContainer.scale.set(1, -1); // Y Up for Spine
        this.app.stage.addChild(this.rootContainer);

        this.skeletonContainer = new PIXI.Container();
        this.skeletonContainer.name = 'skeleton-debug';

        // We will add slot containers directly to RootContainer in draw order, 
        // to mimic Spine's rendering order.

        this.gizmoContainer = new PIXI.Container();

        // Layout: Slots first (bottom), then Skeleton Debug, then Gizmos
        // Since we add slots dynamically, we might need a dedicated container for them to keep order?
        // Let's use a container for all slots to easily manage z-order relative to debug bones.
        this.rootContainer.addChild(this.skeletonContainer);
        this.rootContainer.addChild(this.gizmoContainer);

        this.createGizmos();

        // Interaction
        this.app.stage.interactive = true;
        this.app.stage.hitArea = new PIXI.Rectangle(-10000, -10000, 20000, 20000);
        this.app.stage
            .on('pointerup', this.onDragEnd.bind(this))
            .on('pointerupoutside', this.onDragEnd.bind(this))
            .on('pointermove', this.onDragMove.bind(this));

        window.addEventListener('resize', () => {
            if (canvas && canvas.parentElement) {
                this.app.renderer.resize(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight);
                this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
            }
        });

        this.setupInputListeners(canvas);

        selectedNode.subscribe((node: any) => {
            if (node && node.name) {
                this.selectBone(node.name);
            } else {
                this.hideGizmos();
            }
        });

        currentTool.subscribe((tool) => {
            if (tool === 'select') {
                this.hideGizmos();
            } else if (this.currentBone) {
                this.showGizmo(tool as any);
            }
        });

        renderingScale.subscribe((scale) => {
            this.rootContainer.scale.set(scale, -scale);
        });

        this.app.ticker.add(() => {
            this.updateTransformFromData();
        });
    }

    createGizmos() {
        // --- TRANSLATE GIZMO ---
        this.translateGizmo = new PIXI.Container();
        // X
        const trArrowX = new PIXI.Graphics();
        trArrowX.lineStyle(2, 0xFF0000, 1);
        trArrowX.moveTo(0, 0).lineTo(60, 0);
        trArrowX.beginFill(0xFF0000);
        trArrowX.moveTo(60, -5).lineTo(75, 0).lineTo(60, 5).lineTo(60, -5);
        trArrowX.endFill();
        const hitX = new PIXI.Graphics();
        hitX.beginFill(0xFFFFFF, 0.01);
        hitX.drawRect(0, -10, 75, 20);
        trArrowX.addChild(hitX);
        trArrowX.interactive = true;
        trArrowX.buttonMode = true;
        trArrowX.on('pointerdown', (e: any) => this.onDragStart(e, 'translate', 'x'));
        this.translateGizmo.addChild(trArrowX);
        // Y
        const trArrowY = new PIXI.Graphics();
        trArrowY.lineStyle(2, 0x00FF00, 1);
        trArrowY.moveTo(0, 0).lineTo(0, 60);
        trArrowY.beginFill(0x00FF00);
        trArrowY.moveTo(-5, 60).lineTo(0, 75).lineTo(5, 60).lineTo(-5, 60);
        trArrowY.endFill();
        const hitY = new PIXI.Graphics();
        hitY.beginFill(0xFFFFFF, 0.01);
        hitY.drawRect(-10, 0, 20, 75);
        trArrowY.addChild(hitY);
        trArrowY.interactive = true;
        trArrowY.buttonMode = true;
        trArrowY.on('pointerdown', (e: any) => this.onDragStart(e, 'translate', 'y'));
        this.translateGizmo.addChild(trArrowY);
        // Center
        const trCenter = new PIXI.Graphics();
        trCenter.beginFill(0xFFFF00);
        trCenter.drawRect(-6, -6, 12, 12);
        trCenter.interactive = true;
        trCenter.buttonMode = true;
        trCenter.on('pointerdown', (e: any) => this.onDragStart(e, 'translate', 'both'));
        this.translateGizmo.addChild(trCenter);

        // --- ROTATE GIZMO ---
        this.rotateGizmo = new PIXI.Container();
        const rotCircle = new PIXI.Graphics();
        rotCircle.lineStyle(2, 0x00FFFF, 1);
        rotCircle.drawCircle(0, 0, 50);
        rotCircle.hitArea = new PIXI.Circle(0, 0, 55);
        rotCircle.interactive = true;
        rotCircle.buttonMode = true;
        rotCircle.on('pointerdown', (e: any) => this.onDragStart(e, 'rotate', 'both'));
        const pieVis = new PIXI.Graphics();
        pieVis.name = 'pie';
        this.rotateGizmo.addChild(pieVis);
        this.rotateGizmo.addChild(rotCircle);

        // --- SCALE GIZMO ---
        this.scaleGizmo = new PIXI.Container();
        // X
        const scArrowX = new PIXI.Graphics();
        scArrowX.lineStyle(2, 0xFF0000, 1);
        scArrowX.moveTo(0, 0).lineTo(50, 0);
        scArrowX.beginFill(0xFF0000);
        scArrowX.drawRect(50, -6, 12, 12);
        scArrowX.endFill();
        scArrowX.interactive = true;
        scArrowX.buttonMode = true;
        scArrowX.hitArea = new PIXI.Rectangle(0, -10, 65, 20);
        scArrowX.on('pointerdown', (e: any) => this.onDragStart(e, 'scale', 'x'));
        this.scaleGizmo.addChild(scArrowX);
        // Y
        const scArrowY = new PIXI.Graphics();
        scArrowY.lineStyle(2, 0x00FF00, 1);
        scArrowY.moveTo(0, 0).lineTo(0, 50);
        scArrowY.beginFill(0x00FF00);
        scArrowY.drawRect(-6, 50, 12, 12);
        scArrowY.endFill();
        scArrowY.interactive = true;
        scArrowY.buttonMode = true;
        scArrowY.hitArea = new PIXI.Rectangle(-10, 0, 20, 65);
        scArrowY.on('pointerdown', (e: any) => this.onDragStart(e, 'scale', 'y'));
        this.scaleGizmo.addChild(scArrowY);

        this.gizmoContainer.visible = false;
        this.gizmoContainer.addChild(this.translateGizmo);
        this.gizmoContainer.addChild(this.rotateGizmo);
        this.gizmoContainer.addChild(this.scaleGizmo);
    }

    setupInputListeners(canvas: HTMLCanvasElement) {
        let isPanning = false;
        let lastX = 0;
        let lastY = 0;

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) {
                e.preventDefault();
                isPanning = true;
                lastX = e.clientX;
                lastY = e.clientY;
                canvas.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 1 && isPanning) {
                isPanning = false;
                canvas.style.cursor = 'default';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = e.clientX - lastX;
                const dy = e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                this.rootContainer.x += dx;
                this.rootContainer.y += dy;
            }
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.ctrlKey) {
                const zoomFactor = 0.1;
                const delta = -Math.sign(e.deltaY) * zoomFactor;
                renderingScale.update(s => Math.max(0.1, s + delta));
            } else if (e.shiftKey) {
                this.rootContainer.x -= e.deltaY;
            } else {
                this.rootContainer.y -= e.deltaY;
            }
        }, { passive: false });
    }

    onDragStart(e: any, type: 'translate' | 'rotate' | 'scale', axis: 'x' | 'y' | 'both') {
        if (!this.currentBone) return;
        e.stopPropagation();
        this.isDragging = true;
        this.dragType = type;
        this.dragAxis = axis;
        const globalPos = e.data.global;
        this.dragStartPos.set(globalPos.x, globalPos.y);
        this.boneStartTransform = {
            x: this.currentBone.x,
            y: this.currentBone.y,
            rotation: this.currentBone.rotation,
            scaleX: this.currentBone.scaleX,
            scaleY: this.currentBone.scaleY
        };
    }

    onDragMove(e: any) {
        if (!this.isDragging || !this.currentBone) return;
        const globalPos = e.data.global;
        const dx = globalPos.x - this.dragStartPos.x;
        const dy = globalPos.y - this.dragStartPos.y;

        if (this.dragType === 'translate') {
            const parent = this.boneContainers.get(this.currentBone.name)?.parent || this.rootContainer;
            const startLocal = parent.toLocal(this.dragStartPos);
            const currLocal = parent.toLocal(globalPos);

            if (this.dragAxis === 'x' || this.dragAxis === 'both') {
                this.currentBone.x = this.boneStartTransform.x + (currLocal.x - startLocal.x);
            }
            if (this.dragAxis === 'y' || this.dragAxis === 'both') {
                this.currentBone.y = this.boneStartTransform.y + (currLocal.y - startLocal.y);
            }
        } else if (this.dragType === 'rotate') {
            const center = this.gizmoContainer.getGlobalPosition();
            const startAngle = Math.atan2(this.dragStartPos.y - center.y, this.dragStartPos.x - center.x);
            const currAngle = Math.atan2(globalPos.y - center.y, globalPos.x - center.x);
            let angleDiff = (currAngle - startAngle) * (180 / Math.PI);
            angleDiff = -angleDiff;
            this.currentBone.rotation = this.boneStartTransform.rotation + angleDiff;

            const pie = this.rotateGizmo.getChildByName('pie') as PIXI.Graphics;
            pie.clear();
            pie.beginFill(0xFFFF00, 0.3);
            pie.moveTo(0, 0);
            pie.arc(0, 0, 50, -Math.PI / 2, (-Math.PI / 2) + (angleDiff * Math.PI / 180));
            pie.lineTo(0, 0);
            pie.endFill();
        } else if (this.dragType === 'scale') {
            const sensitivity = 0.01;
            if (this.dragAxis === 'x') {
                this.currentBone.scaleX = this.boneStartTransform.scaleX + dx * sensitivity;
            }
            if (this.dragAxis === 'y') {
                this.currentBone.scaleY = this.boneStartTransform.scaleY - (dy * sensitivity);
            }
        }
        selectedNode.set(this.currentBone);
        this.updateTransformFromData();
    }

    onDragEnd() {
        if (this.isDragging && this.currentBone) {
            const bone = this.currentBone;
            const startState = { ...this.boneStartTransform };
            const endState = {
                x: bone.x,
                y: bone.y,
                rotation: bone.rotation,
                scaleX: bone.scaleX,
                scaleY: bone.scaleY
            };
            if (JSON.stringify(startState) !== JSON.stringify(endState)) {
                const typeName = this.dragType ? this.dragType.charAt(0).toUpperCase() + this.dragType.slice(1) : 'Transform';
                addHistory({
                    name: `${typeName} ${bone.name}`,
                    undo: () => {
                        Object.assign(bone, startState);
                        selectedNode.set(bone);
                    },
                    redo: () => {
                        Object.assign(bone, endState);
                        selectedNode.set(bone);
                    }
                });
            }
        }
        this.isDragging = false;
        this.dragType = null;
        const pie = this.rotateGizmo.getChildByName('pie') as PIXI.Graphics;
        if (pie) pie.clear();
    }

    async loadTexture(atlas: AtlasData, imageUrl: string) {
        this.atlas = atlas;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        this.baseTexture = new PIXI.BaseTexture(img);

        this.regions.clear();
        atlas.regions.forEach(region => {
            // Spine rotate=true means the region in texture is 90 deg Clockwise.
            // Width and Height in atlas parameters are unrotated logical size.
            // Width/Height in image are swapped.

            // Pixi Texture Frame must match the rectangular area on the base texture.
            const frameW = region.rotate ? region.height : region.width;
            const frameH = region.rotate ? region.width : region.height;

            const rect = new PIXI.Rectangle(region.x, region.y, frameW, frameH);

            let tex: PIXI.Texture;
            if (region.rotate) {
                // To display it correctly, we need to counter-rotate it.
                // Pixi GroupD8: 2 is 90 CW. 6 is 90 CCW.
                // We use 6 to rotate it back to upright.
                tex = new PIXI.Texture(
                    this.baseTexture!,
                    rect,
                    new PIXI.Rectangle(0, 0, region.originalWidth, region.originalHeight),
                    new PIXI.Rectangle(0, 0, region.width, region.height),
                    6
                );
            } else {
                // If not rotated, we still need to provide orig/trim info for offsetting/stripping
                // Atlas values:
                // originalWidth/Height: The full size before trimming.
                // offsetX/Y: The offset of the trimmed image from bottom-left (Spine) or top-left?
                // Spine Atlas offsets are usually: offset from bottom left of original image.
                // Textures usually pivot top-left.

                // Spine offsets are: x,y from the bottom left of the original image...
                // Wait, Spine documentation says: "xy: offsets from bottom left of original image to bottom left of packed image."
                // Pixi Trim: x,y from top left.

                // For MVP, standard Texture works reasonably well, but let's try to pass the trim data.

                // Note: PIXI.Texture(base, frame, orig, trim)
                // orig: The original size
                // trim: The rectangle of the cropped image within the original

                // We don't have the 'trim' rectangle explicitly in atlas, we have offsets.
                // Let's stick to simple Texture for unrotated for safety unless we see alignment issues.
                tex = new PIXI.Texture(this.baseTexture!, rect);
            }
            this.regions.set(region.name, tex);
        });

        if (get(skeletonData)) {
            this.loadSkeleton(get(skeletonData)!);
        }
    }

    loadSkeleton(data: SpineData) {
        this.skeletonContainer.removeChildren();
        // Remove existing slot containers
        this.slotContainers.forEach(c => this.rootContainer.removeChild(c));
        this.slotContainers.clear();
        this.boneContainers.clear();

        // 1. Create Bones (Debug Visuals + Hierarchy)
        // Hierarchy is important for calculating 'worldTransform'
        data.bones.forEach(bone => {
            const container = new PIXI.Container();
            container.name = bone.name;
            const gr = this.createBoneGraphics(bone);
            if (gr) container.addChild(gr);
            this.boneContainers.set(bone.name, container);

            if (bone.parent) {
                const parent = this.boneContainers.get(bone.parent);
                if (parent) parent.addChild(container);
            } else {
                this.skeletonContainer.addChild(container); // Add root bone to debug container
            }
        });

        // 2. Create Slots and their Containers
        // In Spine, slots are drawn in a specific order (draw order).
        // Each Slot is attached to a Bone, meaning it moves with the Bone.
        // We create a PIXI Container for each Slot and add it to the Root.
        // We will manually update the SlotContainer's transform to match the Bone's World Transform.

        data.slots.forEach(slot => {
            const slotContainer = new PIXI.Container();
            slotContainer.name = `slot-${slot.name}`;

            // Add to root, but strictly ordered? 
            // We should add them in the order of 'data.slots' (or drawOrder).
            // For now assuming data.slots is the Draw Order initially.
            this.rootContainer.addChildAt(slotContainer, 0); // Add to bottom? No, we iterate 0..N
            // Actually, we should add them in order. 
            // Since we cleared children, we can just addChild.
            // Wait, skeletonContainer is already added. We want slots BEHIND debug skeleton?
            // Root children: [Slot1, Slot2, ..., SkeletonDebug, Gizmos]

            // Let's defer adding to root until AFTER the loop
            this.slotContainers.set(slot.name, slotContainer);

            // Find Attachment
            let attachmentName = slot.attachment;
            const defaultSkin = data.skins.find(s => s.name === "default");
            let attachment: any = null;
            if (defaultSkin && attachmentName) {
                const slotAtts = defaultSkin.attachments.get(slot.name);
                if (slotAtts) attachment = slotAtts.get(attachmentName);
            }

            if (attachment && (attachment.type === AttachmentType.Region || attachment.type === AttachmentType.Mesh || attachment.type === AttachmentType.LinkedMesh)) {
                const path = (attachment as any).path || attachment.name;
                const tex = this.regions.get(path) || this.regions.get(attachment.name);

                if (tex) {
                    const sprite = new PIXI.Sprite(tex);
                    sprite.name = attachment.name;
                    // Store attachment data on sprite for later updates
                    (sprite as any).attachment = attachment;

                    // Add to Slot Container
                    slotContainer.addChild(sprite);
                }
            }
        });

        // Re-order children in Root
        // 1. Slots
        data.slots.forEach(slot => {
            const c = this.slotContainers.get(slot.name);
            if (c) this.rootContainer.addChild(c);
        });
        // 2. Skeleton Debug
        this.rootContainer.addChild(this.skeletonContainer);
        // 3. Gizmos
        this.rootContainer.addChild(this.gizmoContainer);

        this.updateTransformFromData();
    }

    createBoneGraphics(bone: BoneData): PIXI.Graphics | null {
        // ... (Same as before)
        const gr = new PIXI.Graphics();
        const color = bone.length > 0 ? 0x999999 : 0x0088FF;
        gr.name = 'visual';

        if (bone.length > 0) {
            gr.lineStyle(2, color, 1);
            gr.beginFill(color, 0.5);
            const w = Math.min(bone.length / 5, 10);
            gr.moveTo(0, 0);
            gr.lineTo(w, -w).lineTo(bone.length, 0).lineTo(w, w).lineTo(0, 0);
            gr.endFill();
        } else {
            gr.lineStyle(1, color);
            gr.drawCircle(0, 0, 5);
            gr.moveTo(-5, 0).lineTo(5, 0);
            gr.moveTo(0, -5).lineTo(0, 5);
        }
        gr.interactive = true;
        gr.buttonMode = true;
        gr.on('pointerdown', (e) => {
            e.stopPropagation();
            const b = get(skeletonData)?.bones.find(x => x.name === bone.name);
            if (b) selectedNode.set(b);
        });
        return gr;
    }

    updateTransformFromData() {
        const data = get(skeletonData);
        if (!data) return;

        // 1. Update Bones (Local Transforms)
        data.bones.forEach(bone => {
            const c = this.boneContainers.get(bone.name);
            if (c) {
                c.position.set(bone.x, bone.y);
                c.rotation = bone.rotation * DEG_TO_RAD;
                c.scale.set(bone.scaleX ?? 1, bone.scaleY ?? 1);
                c.skew.set(bone.shearX * DEG_TO_RAD || 0, bone.shearY * DEG_TO_RAD || 0);
            }
        });

        // 2. Force World Transforms calculation (Pixi Scene Graph)
        // This propagates transforms down the bone hierarchy.
        this.skeletonContainer.updateTransform();

        // Root Inverse for creating "Skeleton-Relative" transforms
        // We want Slot Containers to be positioned relative to Skeleton Origin.
        // Skeleton Origin is RootContainer's (0,0).
        // Since SlotContainers are children of RootContainer, we just need to set their
        // LocalTransform to equal the Bone's WorldTransform relative to RootContainer.

        const rootInv = this.rootContainer.worldTransform.clone().invert();

        // 3. Update Slots
        data.slots.forEach(slot => {
            const slotContainer = this.slotContainers.get(slot.name);
            const boneBin = this.boneContainers.get(slot.bone);

            if (slotContainer && boneBin) {
                // Determine Bone's relative transform to Root
                // relative = RootInv * BoneTotalWorld
                const boneWorld = boneBin.worldTransform; // Global
                const relativeBoneMatrix = rootInv.clone().append(boneWorld);

                // Set SlotContainer transform to match Bone's relative transform
                // Pixi allows setting local transform directly if we access the TransformBase
                // However, assigning to 'position', 'scale', 'rotation' decomposes the matrix which can be lossy or ambiguous.
                // Better to set the matrix directly if possible, or decompose carefully.
                // For Pixi V5+ this is tricky. 
                // But wait, PIXI Containers update their worldTransform from (pos, rot, scale).
                // If we want to force a specific local matrix, we can use `transform.setFromMatrix` (Available in some versions)
                // Or we decompose.

                // Let's use setFromMatrix as it is standard in modern Pixi
                (slotContainer.transform as any).setFromMatrix(relativeBoneMatrix);

                // Now update the Sprite inside (Attachment Transform)
                if (slotContainer.children.length > 0) {
                    const sprite = slotContainer.children[0] as PIXI.Sprite;
                    const attachment = (sprite as any).attachment;
                    if (attachment) {
                        // Apply attachment properties to Sprite Local Transform
                        sprite.position.set(attachment.x || 0, attachment.y || 0);

                        // Rotations in Spine are CCW degrees. Pixi is CW Radians.
                        // However, we are in a Y-Flipped Root Container (scale(1, -1)).
                        // This flips the visual direction of rotation.
                        // Standard Spine Runtime logic for Y-Down:
                        // Rotation is applied as positive.
                        sprite.rotation = (attachment.rotation || 0) * DEG_TO_RAD;

                        // Scale
                        // Scale Y is flipped in Spine Runtime for RegionAttachments to standardise Y-Up?
                        // Spine Runtime Code: sprite.scale.y = -attachment.scaleY ...
                        // This is likely because the Region texture is usually Y-down (image), but attachment space is Y-up.
                        sprite.scale.set(
                            attachment.scaleX || 1,
                            -(attachment.scaleY || 1)
                        );

                        // Width/Height correction for Trimmed textures
                        // If texture is trimmed, the sprite size is smaller than attachment size.
                        // We must scale it up.
                        if (sprite.texture && sprite.texture.orig) {
                            const regionOriginalW = sprite.texture.orig.width;
                            const regionOriginalH = sprite.texture.orig.height;
                            const attachmentW = (attachment as any).width || regionOriginalW;
                            const attachmentH = (attachment as any).height || regionOriginalH;

                            // Additional scaling factor
                            sprite.scale.x *= (attachmentW / regionOriginalW);
                            sprite.scale.y *= (attachmentH / regionOriginalH);
                        }
                    }
                }
            }
        });

        this.updateGizmoPosition();
    }

    updateGizmoPosition() {
        if (!this.currentBone || !this.gizmoContainer.visible) return;
        const container = this.boneContainers.get(this.currentBone.name);
        if (container) {
            const worldPos = container.getGlobalPosition();
            const localPos = this.rootContainer.toLocal(worldPos);
            this.gizmoContainer.position.set(localPos.x, localPos.y);

            // Calculate Global Rotation for gizmo alignment? 
            // Or just keep gizmo axis-aligned? 
            // Usually gizmos rotate with the object if "Local" mode, or stay 0 if "World" mode.
            // Let's stick to World Alignment for Gizmo parent, but maybe position is enough.
            // If we want rotation:
            if (container.parent) {
                // Simple approx of rotation
                const p1 = container.toGlobal(new PIXI.Point(0, 0));
                const p2 = container.toGlobal(new PIXI.Point(10, 0));
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                this.gizmoContainer.rotation = Math.atan2(dy, dx);
                // Correction for Y-flip root?
                // Math.atan2 gives screen space rotation. 
                // Gizmo container is in Root (Flipped).
                // We need to convert screen rotation to Root rotation.
                // If Root is Y-flipped, a CW screen rotation is CCW root rotation?
                const p1L = this.rootContainer.toLocal(p1);
                const p2L = this.rootContainer.toLocal(p2);
                this.gizmoContainer.rotation = Math.atan2(p2L.y - p1L.y, p2L.x - p1L.x);
            }
        }
    }
    // ... select, hide, show gizmo methods copy-pasted or unchanged ... 
    selectBone(name: string) {
        if (this.currentBone) {
            const oldC = this.boneContainers.get(this.currentBone.name);
            const vis = oldC?.getChildByName('visual') as PIXI.Graphics;
            if (vis) vis.tint = 0xFFFFFF;
        }
        const data = get(skeletonData);
        this.currentBone = data?.bones.find(b => b.name === name) || null;
        if (this.currentBone) {
            const c = this.boneContainers.get(this.currentBone.name);
            const vis = c?.getChildByName('visual') as PIXI.Graphics;
            if (vis) vis.tint = 0x00FFFF;
            this.gizmoContainer.visible = true;
            const tool = get(currentTool);
            if (tool !== 'select') {
                this.showGizmo(tool as any);
            }
            this.updateGizmoPosition();
        } else {
            this.gizmoContainer.visible = false;
        }
    }

    showGizmo(type: 'translate' | 'rotate' | 'scale') {
        this.translateGizmo.visible = type === 'translate';
        this.rotateGizmo.visible = type === 'rotate';
        this.scaleGizmo.visible = type === 'scale';
    }

    hideGizmos() {
        this.gizmoContainer.visible = false;
        this.currentBone = null;
    }
}
