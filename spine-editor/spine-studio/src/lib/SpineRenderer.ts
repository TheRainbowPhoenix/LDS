import * as PIXI from 'pixi.js';
import { Spine } from './spine-pixi/runtime-3.8/Spine';
import { SpineDebugRenderer } from './spine-pixi/base/SpineDebugRenderer';
import { selectedNode, currentTool, renderingScale, addHistory, skeletonData } from './Store';
import { get } from 'svelte/store';
import type { Bone } from './spine-pixi/base/core/ISkeleton';

export class SpineRenderer {
    app: PIXI.Application;
    mainContainer: PIXI.Container;
    spineContainer: PIXI.Container;
    gizmoContainer: PIXI.Container;

    spine: Spine | null = null;
    currentBone: Bone | null = null;

    // Gizmos
    translateGizmo: PIXI.Container;
    rotateGizmo: PIXI.Container;
    scaleGizmo: PIXI.Container;

    // State
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
            backgroundColor: 0x2c2c2c,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            resizeTo: canvas.parentElement as HTMLElement
        });

        this.mainContainer = new PIXI.Container();
        this.mainContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
        this.app.stage.addChild(this.mainContainer);

        this.spineContainer = new PIXI.Container();
        this.gizmoContainer = new PIXI.Container();

        this.mainContainer.addChild(this.spineContainer);
        this.mainContainer.addChild(this.gizmoContainer);

        this.createGizmos();

        // Interaction
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = new PIXI.Rectangle(-10000, -10000, 20000, 20000);
        this.app.stage
            .on('pointerup', (e: any) => this.onDragEnd(e))
            .on('pointerupoutside', (e: any) => this.onDragEnd(e))
            .on('pointermove', (e: any) => this.onDragMove(e));

        window.addEventListener('resize', () => {
            this.mainContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
        });

        this.setupInputListeners(canvas);

        selectedNode.subscribe((node: any) => {
            if (node && node.data && typeof node.data.name === 'string') {
                this.selectBone(node.data.name);
            } else if (node == null) {
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
            this.mainContainer.scale.set(scale);
        });

        this.app.ticker.add(() => {
            this.update();
        });
    }

    async loadSkeleton(jsonPath: string, atlasPath?: string) {
        try {
            if (this.spine) {
                this.spine.destroy({ children: true });
                this.spine = null;
            }
            this.spineContainer.removeChildren();

            const alias = 'spine_' + Date.now();
            PIXI.Assets.add(alias, jsonPath, {
                metadata: atlasPath ? { spineAtlasFile: atlasPath } : undefined
            });
            const spineResource = await PIXI.Assets.load(alias);

            if (spineResource && spineResource.spineData) {
                this.spine = new Spine(spineResource.spineData);
                this.spine.autoUpdate = false;
                this.spine.debug = new SpineDebugRenderer();
                this.spine.debug.drawBones = true;

                this.spineContainer.addChild(this.spine);
                skeletonData.set(spineResource.spineData);
            }
        } catch (e) {
            console.error("Load Skeleton Error:", e);
        }
    }

    update() {
        if (this.spine) {
            const dt = this.app.ticker.elapsedMS / 1000;
            this.spine.update(dt);
        }
        this.updateGizmoPosition();
    }

    selectBone(name: string) {
        if (!this.spine) return;
        const bone = this.spine.skeleton.findBone(name);
        if (bone) {
            this.currentBone = bone;
            this.showGizmo(get(currentTool) as any);
        } else {
            this.currentBone = null;
            this.hideGizmos();
        }
    }

    updateGizmoPosition() {
        if (!this.currentBone || !this.gizmoContainer.visible || !this.spine) return;

        // 1. Position
        const localPoint = new PIXI.Point(this.currentBone.worldX, this.currentBone.worldY);
        const globalPoint = this.spine.toGlobal(localPoint);
        const gizmoPos = this.mainContainer.toLocal(globalPoint);
        this.gizmoContainer.position.set(gizmoPos.x, gizmoPos.y);

        // 2. Rotation - Align to Parent Bone (Local Space)
        if (this.currentBone.parent) {
            // Use getWorldRotationX which returns degrees
            // Note: In some runtimes it is getWorldRotationX(), others might be worldRotationX property
            // We cast to any to avoid strict TS issues if type defs differ
            let worldRot = 0;
            if (typeof (this.currentBone.parent as any).getWorldRotationX === 'function') {
                worldRot = (this.currentBone.parent as any).getWorldRotationX();
            } else {
                // Fallback for property access or 3.8 specifics
                worldRot = (this.currentBone.parent as any).worldRotationX || 0;
            }

            // Pixi is Radians. Spine is Degrees.
            // Also need to account for Spine Y-Flip vs Pixi?
            // Pixi-Spine usually aligns visual Y-flip. 
            // Rotation in degrees +ve is counter-clockwise in Spine, +ve is clockwise in Pixi.
            // Usually `deg * Math.PI / 180` works if systems match.
            // If Spine is Y-up and Pixi is Y-down, rotation is inverted.
            // pixi-spine handles rendering, but our gizmo is pure Pixi.
            // Let's try direct mapping. Use '2' scale on mainContainer.y if needed but we set '1'.

            this.gizmoContainer.rotation = worldRot * (Math.PI / 180);
        } else {
            this.gizmoContainer.rotation = 0;
        }
    }

    createGizmos() {
        // ... Same visuals ...
        this.translateGizmo = new PIXI.Container();
        const trArrowX = new PIXI.Graphics().lineStyle(2, 0xFF0000, 1).moveTo(0, 0).lineTo(60, 0).beginFill(0xFF0000).moveTo(60, -5).lineTo(75, 0).lineTo(60, 5).endFill();
        const hitX = new PIXI.Graphics().beginFill(0xFFFFFF, 0.01).drawRect(0, -10, 75, 20); trArrowX.addChild(hitX);
        trArrowX.eventMode = 'static'; trArrowX.cursor = 'pointer';
        trArrowX.on('pointerdown', (e) => this.onDragStart(e, 'translate', 'x'));

        const trArrowY = new PIXI.Graphics().lineStyle(2, 0x00FF00, 1).moveTo(0, 0).lineTo(0, 60).beginFill(0x00FF00).moveTo(-5, 60).lineTo(0, 75).lineTo(5, 60).endFill();
        const hitY = new PIXI.Graphics().beginFill(0xFFFFFF, 0.01).drawRect(-10, 0, 20, 75); trArrowY.addChild(hitY);
        trArrowY.eventMode = 'static'; trArrowY.cursor = 'pointer';
        trArrowY.on('pointerdown', (e) => this.onDragStart(e, 'translate', 'y'));

        const trCenter = new PIXI.Graphics().beginFill(0xFFFF00).drawRect(-6, -6, 12, 12);
        trCenter.eventMode = 'static'; trCenter.cursor = 'pointer';
        trCenter.on('pointerdown', (e) => this.onDragStart(e, 'translate', 'both'));

        this.translateGizmo.addChild(trArrowX, trArrowY, trCenter);

        this.rotateGizmo = new PIXI.Container();
        const rotCircle = new PIXI.Graphics().lineStyle(2, 0x00FFFF, 1).drawCircle(0, 0, 50);
        rotCircle.hitArea = new PIXI.Circle(0, 0, 55);
        rotCircle.eventMode = 'static'; rotCircle.cursor = 'pointer';
        rotCircle.on('pointerdown', (e) => this.onDragStart(e, 'rotate', 'both'));
        const pieVis = new PIXI.Graphics(); pieVis.name = 'pie';
        this.rotateGizmo.addChild(pieVis, rotCircle);

        this.scaleGizmo = new PIXI.Container();
        const scArrowX = new PIXI.Graphics().lineStyle(2, 0xFF0000, 1).moveTo(0, 0).lineTo(50, 0).beginFill(0xFF0000).drawRect(50, -6, 12, 12);
        scArrowX.eventMode = 'static'; scArrowX.cursor = 'pointer';
        scArrowX.on('pointerdown', (e) => this.onDragStart(e, 'scale', 'x'));
        const scArrowY = new PIXI.Graphics().lineStyle(2, 0x00FF00, 1).moveTo(0, 0).lineTo(0, 50).beginFill(0x00FF00).drawRect(-6, 50, 12, 12);
        scArrowY.eventMode = 'static'; scArrowY.cursor = 'pointer';
        scArrowY.on('pointerdown', (e) => this.onDragStart(e, 'scale', 'y'));
        this.scaleGizmo.addChild(scArrowX, scArrowY);

        this.gizmoContainer.addChild(this.translateGizmo, this.rotateGizmo, this.scaleGizmo);
        this.hideGizmos();
    }

    showGizmo(type: 'translate' | 'rotate' | 'scale') {
        this.hideGizmos();
        this.gizmoContainer.visible = true;
        if (type === 'translate') this.translateGizmo.visible = true;
        if (type === 'rotate') this.rotateGizmo.visible = true;
        if (type === 'scale') this.scaleGizmo.visible = true;
    }

    hideGizmos() {
        this.gizmoContainer.visible = false;
        this.translateGizmo.visible = false;
        this.rotateGizmo.visible = false;
        this.scaleGizmo.visible = false;
    }

    setupInputListeners(canvas: HTMLCanvasElement) {
        // ... (standard pan/zoom logic kept simpler here)
        let isPanning = false, lastX = 0, lastY = 0;
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 1 || e.button === 2) { e.preventDefault(); isPanning = true; lastX = e.clientX; lastY = e.clientY; }
        });
        window.addEventListener('mouseup', () => isPanning = false);
        window.addEventListener('mousemove', (e) => {
            if (isPanning) {
                const dx = e.clientX - lastX; const dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
                this.mainContainer.x += dx; this.mainContainer.y += dy;
            }
        });
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault(); const f = 0.9; const s = this.mainContainer.scale.x;
            if (e.deltaY > 0) this.mainContainer.scale.set(Math.max(0.1, s * f)); else this.mainContainer.scale.set(Math.min(5, s / f));
        }, { passive: false });
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    onDragStart(e: any, type: any, axis: any) {
        if (!this.currentBone) return;
        e.stopPropagation();
        this.isDragging = true;
        this.dragType = type;
        this.dragAxis = axis;
        const global = e.data.global;
        this.dragStartPos.set(global.x, global.y);

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
        const global = e.data.global;

        // --- Calculate Local Delta relative to Gizmo Orientation ---
        const dxGlobal = global.x - this.dragStartPos.x;
        const dyGlobal = global.y - this.dragStartPos.y;

        const gizmoRot = this.gizmoContainer.rotation; // Radians

        // Rotate the global delta into the local space of the gizmo (which matches parent bone)
        // [ x' ]   [ cos  sin ] [ dx ]
        // [ y' ] = [ -sin cos ] [ dy ]   (Inverse rotation)

        const cos = Math.cos(-gizmoRot);
        const sin = Math.sin(-gizmoRot);
        const dxLocal = dxGlobal * cos - dyGlobal * sin;
        const dyLocal = dxGlobal * sin + dyGlobal * cos;

        // Scale Factor (Screen -> World)
        // If the Spine object itself is scaled, we need to account for it. 
        // We are editing 'bone.x/y' which are local to bone parent.
        // We need to account for 'mainContainer.scale.x'. 
        // We assume Uniform Scale for MVP simplifying.

        const viewScale = this.mainContainer.scale.x;

        // Also Spine Y-Axis Direction
        // If Spine is rendering Y-Down (default Pixi), positive dyLocal means Down.
        // bone.y increases Down? 
        // In Spine Editor (Y Up), dragging Up increases Y.
        // In Pixi (Y Down), dragging Up decreases Y.
        // If we want visual match: Dragging along Green Arrow (Y) should increase bone.y?
        // Usually, Gizmo Arrow Y points in +Y direction.
        // We simply add delta.

        if (this.dragType === 'translate') {
            if (this.dragAxis === 'x' || this.dragAxis === 'both') {
                this.currentBone.x = this.boneStartTransform.x + (dxLocal / viewScale);
            }
            if (this.dragAxis === 'y' || this.dragAxis === 'both') {
                // In Pixi coordinate system, Y is Down. 
                // If our Gizmo Y arrow points Down (0, 60), then standard addition works.
                this.currentBone.y = this.boneStartTransform.y + (dyLocal / viewScale);
            }
        }
        else if (this.dragType === 'rotate') {
            // Angle in Global Space
            const center = this.gizmoContainer.getGlobalPosition();
            const startAngle = Math.atan2(this.dragStartPos.y - center.y, this.dragStartPos.x - center.x);
            const endAngle = Math.atan2(global.y - center.y, global.x - center.x);
            let deltaDeg = (endAngle - startAngle) * (180 / Math.PI);

            // Rotation is additive regardless of parent Frame?
            // Yes, bone.rotation is offset from parent. Global rotation delta applies 1:1 to local rotation delta.
            this.currentBone.rotation = this.boneStartTransform.rotation + deltaDeg;

            const pie = this.rotateGizmo.getChildByName('pie') as PIXI.Graphics;
            pie.clear().beginFill(0xFFFF00, 0.3).moveTo(0, 0).arc(0, 0, 50, 0, (endAngle - startAngle)).endFill();
        }
        else if (this.dragType === 'scale') {
            // Scale based on projection along axis
            const sensitivity = 0.01;

            if (this.dragAxis === 'x') this.currentBone.scaleX = this.boneStartTransform.scaleX + (dxLocal * sensitivity);
            if (this.dragAxis === 'y') this.currentBone.scaleY = this.boneStartTransform.scaleY + (dyLocal * sensitivity);
        }

        this.spine.skeleton.updateWorldTransform();
        this.updateGizmoPosition();
        selectedNode.set(this.currentBone);
    }

    onDragEnd(e: any) {
        if (this.isDragging && this.currentBone) {
            const bone = this.currentBone;
            const startState = { ...this.boneStartTransform };
            const endState = { x: bone.x, y: bone.y, rotation: bone.rotation, scaleX: bone.scaleX, scaleY: bone.scaleY };

            // Check if changed
            if (startState.x !== endState.x || startState.y !== endState.y || startState.rotation !== endState.rotation) { // etc
                addHistory({
                    name: 'Transform ' + bone.data.name,
                    undo: () => {
                        if (this.spine) { // Ensure spine exists
                            const b = this.spine.skeleton.findBone(bone.data.name);
                            if (b) {
                                b.x = startState.x; b.y = startState.y; b.rotation = startState.rotation;
                                b.scaleX = startState.scaleX; b.scaleY = startState.scaleY;
                                this.spine.skeleton.updateWorldTransform();
                                this.updateGizmoPosition();
                                selectedNode.set(b);
                            }
                        }
                    },
                    redo: () => {
                        if (this.spine) {
                            const b = this.spine.skeleton.findBone(bone.data.name);
                            if (b) {
                                b.x = endState.x; b.y = endState.y; b.rotation = endState.rotation;
                                b.scaleX = endState.scaleX; b.scaleY = endState.scaleY;
                                this.spine.skeleton.updateWorldTransform();
                                this.updateGizmoPosition();
                                selectedNode.set(b);
                            }
                        }
                    }
                });
            }
        }
        this.isDragging = false;
        this.dragType = null;
        const pie = this.rotateGizmo.getChildByName('pie') as PIXI.Graphics;
        if (pie) pie.clear();
    }
}
