import * as PIXI from 'pixi.js';
import type { SpineData, BoneData } from './SpineParser';
import { skeletonData, selectedNode, currentTool, renderingScale, addHistory } from './Store';
import { get } from 'svelte/store';

export class SpineRenderer {
    app: PIXI.Application;
    rootContainer: PIXI.Container;
    skeletonContainer: PIXI.Container;
    gizmoContainer: PIXI.Container;

    // Gizmos
    translateGizmo: PIXI.Container;
    rotateGizmo: PIXI.Container;
    scaleGizmo: PIXI.Container;

    // State
    currentBone: BoneData | null = null;
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
            backgroundColor: 0x111111, // Darker background
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        // Hierarchy: Stage -> Root (Center) -> [Skeleton, Gizmos]
        this.rootContainer = new PIXI.Container();
        this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
        this.rootContainer.scale.set(1, -1); // Flip Y for Spine coords
        this.app.stage.addChild(this.rootContainer);

        this.skeletonContainer = new PIXI.Container();
        this.rootContainer.addChild(this.skeletonContainer);

        this.gizmoContainer = new PIXI.Container();
        this.rootContainer.addChild(this.gizmoContainer);

        // Initialize Gizmos (Hidden by default)
        this.createGizmos();

        // Interaction Handlers (Global for dragging)
        this.app.stage.interactive = true;
        this.app.stage.hitArea = new PIXI.Rectangle(-10000, -10000, 20000, 20000);
        this.app.stage
            .on('pointerup', this.onDragEnd.bind(this))
            .on('pointerupoutside', this.onDragEnd.bind(this))
            .on('pointermove', this.onDragMove.bind(this));

        // Resize
        window.addEventListener('resize', () => {
            this.app.renderer.resize(canvas.offsetWidth, canvas.offsetHeight);
            this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
        });

        this.setupInputListeners(canvas);

        // Subscribe to store for auto-updates from UI
        selectedNode.subscribe((node: any) => {
            if (node && node.name) {
                this.selectBone(node.name);
            } else {
                this.hideGizmos();
            }
        });

        // Tool change
        currentTool.subscribe((tool) => {
            if (tool === 'select') {
                this.hideGizmos();
            } else if (this.currentBone) {
                this.showGizmo(tool as any);
            }
        });

        // Zoom change
        renderingScale.subscribe((scale) => {
            this.rootContainer.scale.set(scale, -scale); // Maintain Y-flip
        });

        // Subscribe to data changes
        this.app.ticker.add(() => {
            this.updateTransformFromData();
        });
    }

    createGizmos() {
        // --- TRANSLATE GIZMO ---
        this.translateGizmo = new PIXI.Container();

        // X-Axis (Red)
        const trArrowX = new PIXI.Graphics();
        trArrowX.lineStyle(2, 0xFF0000, 1);
        trArrowX.moveTo(0, 0).lineTo(60, 0); // Line
        trArrowX.beginFill(0xFF0000);
        trArrowX.moveTo(60, -5).lineTo(75, 0).lineTo(60, 5).lineTo(60, -5); // Arrowhead
        trArrowX.endFill();
        // Hit Area
        const hitX = new PIXI.Graphics();
        hitX.beginFill(0xFFFFFF, 0.01);
        hitX.drawRect(0, -10, 75, 20);
        trArrowX.addChild(hitX);
        trArrowX.interactive = true;
        trArrowX.buttonMode = true;
        trArrowX.on('pointerdown', (e: any) => this.onDragStart(e, 'translate', 'x'));
        this.translateGizmo.addChild(trArrowX);

        // Y-Axis (Green)
        const trArrowY = new PIXI.Graphics();
        trArrowY.lineStyle(2, 0x00FF00, 1);
        trArrowY.moveTo(0, 0).lineTo(0, 60);
        trArrowY.beginFill(0x00FF00);
        trArrowY.moveTo(-5, 60).lineTo(0, 75).lineTo(5, 60).lineTo(-5, 60);
        trArrowY.endFill();
        // Hit Area
        const hitY = new PIXI.Graphics();
        hitY.beginFill(0xFFFFFF, 0.01);
        hitY.drawRect(-10, 0, 20, 75);
        trArrowY.addChild(hitY);
        trArrowY.interactive = true;
        trArrowY.buttonMode = true;
        trArrowY.on('pointerdown', (e: any) => this.onDragStart(e, 'translate', 'y'));
        this.translateGizmo.addChild(trArrowY);

        // Center (Both)
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
        // Hit Area (Ring)
        rotCircle.hitArea = new PIXI.Circle(0, 0, 55);
        rotCircle.interactive = true;
        rotCircle.buttonMode = true;
        rotCircle.on('pointerdown', (e: any) => this.onDragStart(e, 'rotate', 'both'));

        // Pie visualization
        const pieVis = new PIXI.Graphics();
        pieVis.name = 'pie';
        this.rotateGizmo.addChild(pieVis);
        this.rotateGizmo.addChild(rotCircle);


        // --- SCALE GIZMO ---
        this.scaleGizmo = new PIXI.Container();
        // X-Axis Scale
        const scArrowX = new PIXI.Graphics();
        scArrowX.lineStyle(2, 0xFF0000, 1);
        scArrowX.moveTo(0, 0).lineTo(50, 0);
        scArrowX.beginFill(0xFF0000);
        scArrowX.drawRect(50, -6, 12, 12); // Square handle
        scArrowX.endFill();
        scArrowX.interactive = true;
        scArrowX.buttonMode = true;
        scArrowX.hitArea = new PIXI.Rectangle(0, -10, 65, 20);
        scArrowX.on('pointerdown', (e: any) => this.onDragStart(e, 'scale', 'x'));
        this.scaleGizmo.addChild(scArrowX);

        // Y-Axis Scale
        const scArrowY = new PIXI.Graphics();
        scArrowY.lineStyle(2, 0x00FF00, 1);
        scArrowY.moveTo(0, 0).lineTo(0, 50);
        scArrowY.beginFill(0x00FF00);
        scArrowY.drawRect(-6, 50, 12, 12); // Square handle
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
        this.gizmoContainer.addChild(this.scaleGizmo);
    }

    setupInputListeners(canvas: HTMLCanvasElement) {
        let isPanning = false;
        let lastX = 0;
        let lastY = 0;

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1) { // Middle Mouse
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

            // Ctrl + Scroll = Zoom
            if (e.ctrlKey) {
                const zoomFactor = 0.1;
                const delta = -Math.sign(e.deltaY) * zoomFactor;
                renderingScale.update(s => Math.max(0.1, s + delta));
            }
            // Shift + Scroll = Pan X
            else if (e.shiftKey) {
                this.rootContainer.x -= e.deltaY;
            }
            // Scroll = Pan Y
            else {
                this.rootContainer.y -= e.deltaY;
            }
        }, { passive: false });
    }

    // --- Interaction ---
    onDragStart(e: any, type: 'translate' | 'rotate' | 'scale', axis: 'x' | 'y' | 'both') {
        if (!this.currentBone) return;
        e.stopPropagation();
        this.isDragging = true;
        this.dragType = type;
        this.dragAxis = axis;

        // Record stat pos
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

        // Account for Zoom in pixel-based scaling?
        // For Translate: We use toLocal, which handles renderingScale automatically (as rootContainer is scaled).
        // Only pure pixel deltas (like Scale tool maybe?) need manual adjustment if we want 1:1 screen mapping.

        if (this.dragType === 'translate') {
            // Gizmo aligns with Parent axes (see updateGizmoPosition). 
            // So dragging Gizmo X means we want to change Bone X (Parent Space X).
            // We need to project the Global Delta onto the Parent Axes.
            // toLocal does exactly that!

            const parent = this.boneContainers.get(this.currentBone.name)?.parent || this.rootContainer;
            const startLocal = parent.toLocal(this.dragStartPos);
            const currLocal = parent.toLocal(globalPos);

            if (this.dragAxis === 'x' || this.dragAxis === 'both') {
                this.currentBone.x = this.boneStartTransform.x + (currLocal.x - startLocal.x);
            }
            if (this.dragAxis === 'y' || this.dragAxis === 'both') {
                this.currentBone.y = this.boneStartTransform.y + (currLocal.y - startLocal.y);
            }
        }
        else if (this.dragType === 'rotate') {
            const center = this.gizmoContainer.getGlobalPosition();
            const startAngle = Math.atan2(this.dragStartPos.y - center.y, this.dragStartPos.x - center.x);
            const currAngle = Math.atan2(globalPos.y - center.y, globalPos.x - center.x);
            let angleDiff = (currAngle - startAngle) * (180 / Math.PI);

            // Pixi Y-down vs Spine Y-up.
            // If we drag CW in screen, angleDiff is Positive. 
            // In Spine (Y-up), CW is Negative.
            // So we negate.
            angleDiff = -angleDiff;

            this.currentBone.rotation = this.boneStartTransform.rotation + angleDiff;

            // Draw Pie
            const pie = this.rotateGizmo.getChildByName('pie') as PIXI.Graphics;
            pie.clear();
            pie.beginFill(0xFFFF00, 0.3);
            pie.moveTo(0, 0);
            pie.arc(0, 0, 50, -Math.PI / 2, (-Math.PI / 2) + (angleDiff * Math.PI / 180));
            pie.lineTo(0, 0);
            pie.endFill();
        }
        else if (this.dragType === 'scale') {
            const sensitivity = 0.01;
            // Scale delta based on screen pixels? 
            // If zoomed in, pixels move faster relative to bone units.
            // But user expects 100px drag = same scale change regardless of zoom usually.

            if (this.dragAxis === 'x') {
                this.currentBone.scaleX = this.boneStartTransform.scaleX + dx * sensitivity;
            }
            if (this.dragAxis === 'y') {
                this.currentBone.scaleY = this.boneStartTransform.scaleY - (dy * sensitivity);
            }
        }

        // Notify Svelte Store (Force update to UI)
        selectedNode.set(this.currentBone);
        this.updateTransformFromData();
    }

    onDragEnd() {
        if (this.isDragging && this.currentBone) {
            // Commit to History
            const bone = this.currentBone;
            const startState = { ...this.boneStartTransform };
            const endState = {
                x: bone.x,
                y: bone.y,
                rotation: bone.rotation,
                scaleX: bone.scaleX,
                scaleY: bone.scaleY
            };

            // Only add if changed
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

    // --- Loading & Rendering ---

    loadSkeleton(data: SpineData) {
        this.skeletonContainer.removeChildren();
        this.boneContainers.clear();

        data.bones.forEach(bone => {
            const container = new PIXI.Container();
            container.name = bone.name;

            // Visual
            const gr = this.createBoneGraphics(bone);
            if (gr) container.addChild(gr);

            this.boneContainers.set(bone.name, container);

            // Add to parent
            if (bone.parent) {
                const parent = this.boneContainers.get(bone.parent);
                if (parent) parent.addChild(container);
                else this.skeletonContainer.addChild(container);
            } else {
                this.skeletonContainer.addChild(container);
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

        // Add click listener to select bone
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

        data.bones.forEach(bone => {
            const c = this.boneContainers.get(bone.name);
            if (c) {
                c.position.set(bone.x, bone.y);
                c.rotation = bone.rotation * (Math.PI / 180);
                c.scale.set(bone.scaleX ?? 1, bone.scaleY ?? 1);
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

            // Align with Parent Rotation to solve "Click Y moves X" confusion.
            // If parent is rotated, bone.x moves along parent's X axis.
            // Gizmo X should match Parent X.
            if (container.parent) {
                // In generic Pixi (v4/v5/v7), getting accumulated parent rotation is usually worldRotation.
                // We want to apply that rotation to Gizmo (which is child of root).
                // Since Root is usually 0 rotation (except Y scale), local rotation relative to root is roughly world rotation.
                // However, container.parent.rotation is just LOCAL rotation of parent.
                // We need sum of ancestors.

                // Hacky reliable way without matrix decomposition:
                // Use a point (10,0) in parent space, project to root space, get angle.
                const p0 = container.parent.toLocal(new PIXI.Point(0, 0), this.rootContainer);
                const p1 = container.parent.toLocal(new PIXI.Point(10, 0), this.rootContainer);
                // Wait, toLocal(global, from).
                // We want pt in parent -> pt in root.
                // const globalPt = parent.toGlobal(localPt); const rootPt = root.toLocal(globalPt);

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

    // API
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
