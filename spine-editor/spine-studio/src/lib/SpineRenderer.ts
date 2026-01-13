import * as PIXI from 'pixi.js';
import { Spine } from './spine-pixi/runtime-3.8/Spine';
import { selectedNode, currentTool, renderingScale, addHistory, skeletonData } from './Store';
import { get } from 'svelte/store';
import { Bone } from './spine-pixi/runtime-3.8/core/Bone';
import type { Slot } from './spine-pixi/runtime-3.8/core/Slot';
import { RegionAttachment } from './spine-pixi/runtime-3.8/core/attachments/RegionAttachment';
import { MeshAttachment } from './spine-pixi/runtime-3.8/core/attachments/MeshAttachment';

export class SpineRenderer {
    app: PIXI.Application;
    mainContainer: PIXI.Container;
    spineContainer: PIXI.Container;
    gizmoContainer: PIXI.Container;
    editorContainer: PIXI.Container;

    spine: Spine | null = null;
    currentBone: Bone | null = null;
    currentSlot: Slot | null = null;

    // Gizmos
    translateGizmo: PIXI.Container;
    rotateGizmo: PIXI.Container;
    scaleGizmo: PIXI.Container;

    // Mesh Editor State
    private meshDebug: PIXI.Graphics;
    private handlePool: PIXI.Container[] = [];
    draggingVertexIndex: number = -1;

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
        this.editorContainer = new PIXI.Container();
        this.gizmoContainer = new PIXI.Container();

        this.mainContainer.addChild(this.spineContainer);
        this.spineContainer.addChild(this.editorContainer);
        this.mainContainer.addChild(this.gizmoContainer);

        // Initialize Mesh Editor Graphics
        this.meshDebug = new PIXI.Graphics();
        this.meshDebug.name = "mesh_wires";
        this.editorContainer.addChild(this.meshDebug);

        // --- Selection Logic (Clicking Slots) ---
        this.spineContainer.eventMode = 'static';
        this.spineContainer.on('pointerdown', (e: any) => {
            const target = e.target as any;
            if (target && target.slot) {
                console.log("Selected Slot via click:", target.slot);
                selectedNode.set(target.slot);
                e.stopPropagation();
            }
        });

        this.createGizmos();

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
            this.handleSelection(node);
        });

        currentTool.subscribe((tool) => {
            this.updateGizmoVisibility();
        });

        renderingScale.subscribe((scale) => {
            this.mainContainer.scale.set(scale);
        });

        this.app.ticker.add(() => {
            this.update();
        });
    }

    handleSelection(node: any) {
        this.currentBone = null;
        this.currentSlot = null;
        this.hideGizmos();

        if (!node) return;

        if ((node.data && node.data.bones) || (node.worldX !== undefined && (node as any).children)) {
            this.currentBone = node;
            this.showGizmo(get(currentTool) as any);
        }
        else if (node.bone || (node.data && node.data.boneData)) {
            this.currentSlot = node;
        }
    }

    updateGizmoVisibility() {
        if (this.currentBone && get(currentTool) !== 'select') {
            this.showGizmo(get(currentTool) as any);
        } else {
            this.hideGizmos();
        }
    }

    async loadSkeleton(jsonPath: string, atlasPath?: string) {
        try {
            if (this.spine) {
                this.spine.destroy({ children: true });
                this.spine = null;
            }
            // Clear spine container but PRESERVE editor container
            // We can just remove children except editorContainer?
            // Or remove all and re-add editorContainer.
            this.spineContainer.removeChildren();
            this.spineContainer.addChild(this.editorContainer);

            const alias = 'spine_' + Date.now();
            PIXI.Assets.add(alias, jsonPath, {
                metadata: atlasPath ? { spineAtlasFile: atlasPath } : undefined
            });
            const spineResource = await PIXI.Assets.load(alias);

            if (spineResource && spineResource.spineData) {
                this.spine = new Spine(spineResource.spineData);
                this.spine.autoUpdate = false;

                this.spineContainer.addChild(this.spine);
                // Ensure Editor is on Top
                this.spineContainer.setChildIndex(this.editorContainer, this.spineContainer.children.length - 1);

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
            // Ensure Editor is on top
            if (this.editorContainer.parent === this.spineContainer) {
                const lastIdx = this.spineContainer.children.length - 1;
                if (this.spineContainer.getChildIndex(this.editorContainer) !== lastIdx) {
                    this.spineContainer.setChildIndex(this.editorContainer, lastIdx);
                }
            }
        }
        this.updateGizmoPosition();
        this.updateMeshEditor();
    }

    // --- MESH EDITOR ---
    updateMeshEditor() {
        // RESET STATE if not valid
        if (!this.currentSlot || !this.spine) {
            this.meshDebug.clear();
            for (const h of this.handlePool) h.visible = false;
            return;
        }

        const attachment = this.currentSlot.getAttachment();
        if (!attachment || !(attachment instanceof RegionAttachment || attachment instanceof MeshAttachment)) {
            this.meshDebug.clear();
            for (const h of this.handlePool) h.visible = false;
            return;
        }

        // RENDER
        this.renderMesh(this.currentSlot, attachment);
    }

    renderMesh(slot: Slot, attachment: RegionAttachment | MeshAttachment) {
        const worldVerticesLength = (attachment instanceof MeshAttachment) ? attachment.worldVerticesLength : 8;
        // Float32Array creation every frame is minor, but could simply reuse a large buffer if needed.
        // For now, new Float32Array is fine (GC handles it well usually).
        const vertices = new Float32Array(worldVerticesLength);

        if (attachment instanceof RegionAttachment) {
            attachment.computeWorldVertices(slot.bone, vertices, 0, 2);
        } else {
            attachment.computeWorldVertices(slot, 0, attachment.worldVerticesLength, vertices, 0, 2);
        }

        const g = this.meshDebug;
        g.clear();

        // 1. Internal Triangles (Orange)
        g.lineStyle(1, 0xffa500, 0.6);
        let triangles: number[] = [];
        if (attachment instanceof MeshAttachment) {
            triangles = attachment.triangles;
        } else {
            triangles = [0, 1, 2, 2, 3, 0];
        }

        for (let i = 0; i < triangles.length; i += 3) {
            const t1 = triangles[i] * 2;
            const t2 = triangles[i + 1] * 2;
            const t3 = triangles[i + 2] * 2;

            g.moveTo(vertices[t1], vertices[t1 + 1]);
            g.lineTo(vertices[t2], vertices[t2 + 1]);
            g.lineTo(vertices[t3], vertices[t3 + 1]);
            g.lineTo(vertices[t1], vertices[t1 + 1]);
        }

        // 2. Hull Outline (Cyan)
        g.lineStyle(2, 0x00ffff, 1);
        let hullLength = 0;
        if (attachment instanceof MeshAttachment) {
            hullLength = (attachment as any).hullLength;
            if (!hullLength && (attachment as any).hullLength === undefined) hullLength = vertices.length / 2;
            else if (!hullLength) hullLength = (attachment as any).hullLength;
        } else {
            hullLength = 4;
        }

        if (hullLength > 0) {
            g.moveTo(vertices[0], vertices[1]);
            for (let i = 1; i < hullLength; i++) {
                g.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
            }
            g.lineTo(vertices[0], vertices[1]);
        }

        // 3. Vertices (Pooled Handles)
        for (let i = 0; i < vertices.length; i += 2) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const vIdx = i / 2;

            let handle: any = this.handlePool[vIdx];
            if (!handle) {
                // Create new Handle
                const h = new PIXI.Graphics();
                h.beginFill(0x2c2c2c).lineStyle(2, 0x00ffff, 1).drawCircle(0, 0, 5).endFill();
                h.eventMode = 'static';
                h.cursor = 'pointer';

                // Closure to capture 'this' correctly. 
                // e.target will be 'h'. We attach meta to 'h'.
                h.on('pointerdown', (e: any) => {
                    const t = e.target as any;
                    this.onVertexDragStart(e, t.vertexIndex, this.currentSlot, this.currentSlot?.getAttachment());
                });

                this.editorContainer.addChild(h);
                this.handlePool.push(h);
                handle = h;
            }

            handle.visible = true;
            handle.position.set(x, y);
            handle.vertexIndex = vIdx; // Update index
        }

        // Hide unused handles
        for (let i = vertices.length / 2; i < this.handlePool.length; i++) {
            this.handlePool[i].visible = false;
        }
    }

    onVertexDragStart(e: any, index: number, slot: Slot | null, attachment: any) {
        if (!slot || !attachment) return;
        e.stopPropagation();
        this.isDragging = true;
        this.draggingVertexIndex = index;

        const global = e.data.global;
        this.dragStartPos.set(global.x, global.y);
    }

    // ... Drag Move / End ... (restored below)

    selectBone(name: string) {
        if (!this.spine) return;
        const bone = this.spine.skeleton.findBone(name);
        if (bone) {
            this.currentBone = bone;
            this.currentSlot = null;
            this.showGizmo(get(currentTool) as any);
        }
    }

    updateGizmoPosition() {
        if (!this.currentBone || !this.gizmoContainer.visible || !this.spine) return;
        const localPoint = new PIXI.Point(this.currentBone.worldX, this.currentBone.worldY);
        const globalPoint = this.spine.toGlobal(localPoint);
        const gizmoPos = this.mainContainer.toLocal(globalPoint);
        this.gizmoContainer.position.set(gizmoPos.x, gizmoPos.y);

        if (this.currentBone.parent) {
            let worldRot = 0;
            if (typeof (this.currentBone.parent as any).getWorldRotationX === 'function') {
                worldRot = (this.currentBone.parent as any).getWorldRotationX();
            } else {
                worldRot = (this.currentBone.parent as any).worldRotationX || 0;
            }
            this.gizmoContainer.rotation = worldRot * (Math.PI / 180);
        } else {
            this.gizmoContainer.rotation = 0;
        }
    }

    createGizmos() {
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
            x: this.currentBone.x, y: this.currentBone.y, rotation: this.currentBone.rotation,
            scaleX: this.currentBone.scaleX, scaleY: this.currentBone.scaleY
        };
    }

    onDragMove(e: any) {
        if (!this.isDragging) return;

        // --- VERTEX DRAGGING ---
        if (this.draggingVertexIndex >= 0 && this.currentSlot && this.currentSlot.bone) {
            const global = e.data.global;
            const attachment = this.currentSlot.getAttachment() as any;
            if (!attachment) return;

            const spineLocal = this.spineContainer.toLocal(global);
            const boneLocal = { x: 0, y: 0 };
            this.currentSlot.bone.worldToLocal(spineLocal, boneLocal);

            const idx = this.draggingVertexIndex * 2;

            if (attachment instanceof RegionAttachment) {
                attachment.offset[idx] = boneLocal.x;
                attachment.offset[idx + 1] = boneLocal.y;
                attachment.updateOffset();
            } else if (attachment instanceof MeshAttachment) {
                if (attachment.bones && attachment.bones.length > 0) {
                    // Weighted - limited support
                } else {
                    attachment.vertices[idx] = boneLocal.x;
                    attachment.vertices[idx + 1] = boneLocal.y;
                }
            }
            return;
        }

        if (!this.currentBone) return;
        const global = e.data.global;
        const dxGlobal = global.x - this.dragStartPos.x;
        const dyGlobal = global.y - this.dragStartPos.y;
        const gizmoRot = this.gizmoContainer.rotation;
        const cos = Math.cos(-gizmoRot);
        const sin = Math.sin(-gizmoRot);
        const dxLocal = dxGlobal * cos - dyGlobal * sin;
        const dyLocal = dxGlobal * sin + dyGlobal * cos;
        const viewScale = this.mainContainer.scale.x;

        if (this.dragType === 'translate') {
            if (this.dragAxis === 'x' || this.dragAxis === 'both') this.currentBone.x = this.boneStartTransform.x + (dxLocal / viewScale);
            if (this.dragAxis === 'y' || this.dragAxis === 'both') this.currentBone.y = this.boneStartTransform.y + (dyLocal / viewScale);
        }
        else if (this.dragType === 'rotate') {
            const center = this.gizmoContainer.getGlobalPosition();
            const startAngle = Math.atan2(this.dragStartPos.y - center.y, this.dragStartPos.x - center.x);
            const endAngle = Math.atan2(global.y - center.y, global.x - center.x);
            let deltaDeg = (endAngle - startAngle) * (180 / Math.PI);
            this.currentBone.rotation = this.boneStartTransform.rotation + deltaDeg;
            const pie = this.rotateGizmo.getChildByName('pie') as PIXI.Graphics;
            pie.clear().beginFill(0xFFFF00, 0.3).moveTo(0, 0).arc(0, 0, 50, 0, (endAngle - startAngle)).endFill();
        }
        else if (this.dragType === 'scale') {
            const sensitivity = 0.01;
            if (this.dragAxis === 'x') this.currentBone.scaleX = this.boneStartTransform.scaleX + (dxLocal * sensitivity);
            if (this.dragAxis === 'y') this.currentBone.scaleY = this.boneStartTransform.scaleY + (dyLocal * sensitivity);
        }

        if (this.spine) this.spine.skeleton.updateWorldTransform();
        this.updateGizmoPosition();
        selectedNode.set(this.currentBone);
    }

    onDragEnd(e: any) {
        this.draggingVertexIndex = -1;

        if (this.isDragging && this.currentBone) {
            const bone = this.currentBone;
            const startState = { ...this.boneStartTransform };
            const endState = { x: bone.x, y: bone.y, rotation: bone.rotation, scaleX: bone.scaleX, scaleY: bone.scaleY };

            if (startState.x !== endState.x || startState.y !== endState.y || startState.rotation !== endState.rotation) {
                addHistory({
                    name: 'Transform ' + bone.data.name,
                    undo: () => {
                        if (this.spine) {
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
