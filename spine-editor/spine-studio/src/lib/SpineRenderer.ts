import * as PIXI from 'pixi.js';
import { type SpineData, type BoneData, type AtlasData, type AtlasRegion, AttachmentType, type SkinData } from './SpineParser';
import { skeletonData, selectedNode, currentTool, renderingScale, addHistory } from './Store';
import { get } from 'svelte/store';

export class SpineRenderer {
    app: PIXI.Application;
    rootContainer: PIXI.Container;
    skeletonContainer: PIXI.Container;
    slotContainer: PIXI.Container;
    gizmoContainer: PIXI.Container;

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
    boneContainers = new Map<string, PIXI.Container>();
    slotSprites = new Map<string, PIXI.Sprite | PIXI.Container>();

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

        // Hierarchy: Stage -> Root -> [Slots, Skeleton(Debug), Gizmos]
        this.rootContainer = new PIXI.Container();
        this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
        this.rootContainer.scale.set(1, -1);
        this.app.stage.addChild(this.rootContainer);

        this.slotContainer = new PIXI.Container();
        this.slotContainer.name = 'slots';
        this.rootContainer.addChild(this.slotContainer);

        this.skeletonContainer = new PIXI.Container();
        this.skeletonContainer.name = 'skeleton-debug';
        this.rootContainer.addChild(this.skeletonContainer);

        this.gizmoContainer = new PIXI.Container();
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
            this.app.renderer.resize(canvas.offsetWidth, canvas.offsetHeight);
            this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
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

        // Load image manually to bypass Pixi V4 URL parsing issues in Vite
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
            // If rotated, the dimensions in the atlas are swapped (Height becomes Width).
            // region.width/height from parser are the 'size' line, which lists unrotated logical size.
            const frameW = region.rotate ? region.height : region.width;
            const frameH = region.rotate ? region.width : region.height;

            const rect = new PIXI.Rectangle(region.x, region.y, frameW, frameH);

            let tex: PIXI.Texture;
            if (region.rotate) {
                // Spine rotate=true means the region is stored rotated 90 deg CW.
                // Pixi Texture rotate: 2 = 90 deg CW, 6 = 90 deg CCW
                tex = new PIXI.Texture(
                    this.baseTexture!,
                    rect,
                    new PIXI.Rectangle(0, 0, region.originalWidth, region.originalHeight),
                    new PIXI.Rectangle(0, 0, region.width, region.height),
                    6
                );
            } else {
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
        this.slotContainer.removeChildren();
        this.boneContainers.clear();
        this.slotSprites.clear();

        // 1. Bones
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
                this.skeletonContainer.addChild(container);
            }
        });

        // 2. Slots
        data.slots.forEach(slot => {
            let attachmentName = slot.attachment;
            let attachment: any = null;

            const defaultSkin = data.skins.find(s => s.name === "default");
            if (defaultSkin && attachmentName) {
                const slotAtts = defaultSkin.attachments.get(slot.name);
                if (slotAtts) {
                    attachment = slotAtts.get(attachmentName);
                }
            }

            // Fallback for non-regions: Use Sprite or Container
            const sprite = new PIXI.Sprite();
            sprite.name = slot.name;

            if (attachment && (attachment.type === AttachmentType.Region || attachment.type === AttachmentType.Mesh || attachment.type === AttachmentType.LinkedMesh)) {
                const path = (attachment as any).path || attachment.name;
                const tex = this.regions.get(path) || this.regions.get(attachment.name);
                if (tex) {
                    sprite.texture = tex;
                }
                sprite.anchor.set(0.5, 0.5);
                (sprite as any).attachment = attachment;
                (sprite as any).boneName = slot.bone;

                this.slotContainer.addChild(sprite);
                this.slotSprites.set(slot.name, sprite);
            }
        });

        this.updateTransformFromData();
    }

    createBoneGraphics(bone: BoneData): PIXI.Graphics | null {
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

        // 1. Update Bones from Stores (or internal state if dragging)
        data.bones.forEach(bone => {
            const c = this.boneContainers.get(bone.name);
            if (c) {
                c.position.set(bone.x, bone.y);
                c.rotation = bone.rotation * (Math.PI / 180);
                c.scale.set(bone.scaleX ?? 1, bone.scaleY ?? 1);
                c.skew.set(bone.shearX * (Math.PI / 180) || 0, bone.shearY * (Math.PI / 180) || 0);
            }
        });

        // 3. Force World Transforms
        this.skeletonContainer.updateTransform();

        // 4. Slots
        // We need the inverse of the RootWorldTransform to convert BoneWorldTransform back to "Root Local Space"
        // This effectively gives us the Bone's transform relative to the Root.
        // Since SlotContainer is a direct child of Root (and usually Identity), this puts the Slot in the correct place relative to the Skeleton.
        const rootInv = this.rootContainer.worldTransform.clone().invert();

        this.slotSprites.forEach((sprite, slotName) => {
            const attachment = (sprite as any).attachment;
            const boneName = (sprite as any).boneName;

            if (attachment && boneName) {
                const boneBin = this.boneContainers.get(boneName);
                if (boneBin) {
                    // 1. Get Bone World Matrix
                    const boneWorld = boneBin.worldTransform;

                    // 2. Convert to Root Local Space (Bone Relative Matrix)
                    // relative = rootInv * boneWorld
                    // Pixi Matrix.append: A.append(B) => A * B
                    const boneRel = rootInv.clone().append(boneWorld);

                    // 3. Attachment Local Matrix
                    const localMat = new PIXI.Matrix();

                    // Spine specific: Flip Y scale for Region attachments to render right-side up in our Y-flipped root world.
                    // Also negative rotation usually? Spine is CCW. Pixi is CW. 
                    // But we are in a flipped Y container, which flips rotation direction visually.
                    // Testing: Keep rotation positive (Spine degrees), Flip Scale Y.

                    localMat.scale(attachment.scaleX || 1, -(attachment.scaleY || 1));
                    localMat.rotate((attachment.rotation || 0) * (Math.PI / 180));
                    localMat.translate(attachment.x || 0, attachment.y || 0);

                    // 4. Combine: Final = BoneRel * AttachmentLocal
                    // Pixi: localMat.prepend(boneRel) => boneRel * localMat
                    const result = localMat.prepend(boneRel);

                    (sprite.transform as PIXI.Transform).setFromMatrix(result);
                    sprite.visible = true;
                }
            } else {
                sprite.visible = false;
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
            if (container.parent) {
                const g0 = container.parent.toGlobal(new PIXI.Point(0, 0));
                const g1 = container.parent.toGlobal(new PIXI.Point(100, 0));
                const r0 = this.rootContainer.toLocal(g0);
                const r1 = this.rootContainer.toLocal(g1);
                this.gizmoContainer.rotation = Math.atan2(r1.y - r0.y, r1.x - r0.x);
            } else {
                this.gizmoContainer.rotation = 0;
            }
        }
    }

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
