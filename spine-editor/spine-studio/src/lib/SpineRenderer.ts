import * as PIXI from 'pixi.js';
import type { SpineData, BoneData } from './SpineParser';

export class SpineRenderer {
    app: PIXI.Application;
    rootContainer: PIXI.Container;
    debugGraphics: PIXI.Graphics;

    constructor(canvas: HTMLCanvasElement) {
        this.app = new PIXI.Application({
            view: canvas,
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
            backgroundColor: 0x222222,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        this.rootContainer = new PIXI.Container();
        this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8); // Center bottomish
        this.rootContainer.scale.set(1, -1); // Flip Y because Spine is Y-up usually, but let's check standard. Actually spine export is Y-down in Pixi usually?
        // Standard Spine is Y-up (Cartesian), but standard 2D coords are Y-down.
        // Usually we need to flip the root.

        this.app.stage.addChild(this.rootContainer);

        this.debugGraphics = new PIXI.Graphics();
        this.rootContainer.addChild(this.debugGraphics);

        // Handle resize
        window.addEventListener('resize', () => {
            this.app.renderer.resize(canvas.offsetWidth, canvas.offsetHeight);
            this.rootContainer.position.set(this.app.renderer.width / 2, this.app.renderer.height * 0.8);
        });
    }

    loadSkeleton(data: SpineData) {
        this.rootContainer.removeChildren();
        this.debugGraphics = new PIXI.Graphics();
        this.rootContainer.addChild(this.debugGraphics);

        // We will build a container hierarchy for the bones
        // BUT for MVP debug drawing, we might just want to calculate world points or use containers.
        // Let's use Containers as they handle rotation/scale hierarchy for us.

        const boneContainers = new Map<string, PIXI.Container>();

        // Sort bones by parent to ensure parents creation first? 
        // Logic: Iterate, if parent not created, create parent recursively?
        // Or just multiple passes. Bones are usually ordered in the JSON (Breadth-first or Depth-first).
        // Let's assume order.

        data.bones.forEach(bone => {
            const container = new PIXI.Container();
            container.name = bone.name;

            // Transforms
            container.position.set(bone.x, bone.y);
            container.rotation = (bone.rotation) * (Math.PI / 180); // Deg to Rad
            container.scale.set(bone.scaleX, bone.scaleY);
            // Ignore shear for MVP

            boneContainers.set(bone.name, container);

            if (bone.parent) {
                const parent = boneContainers.get(bone.parent);
                if (parent) {
                    parent.addChild(container);
                } else {
                    console.warn(`Parent ${bone.parent} not found for ${bone.name}`);
                    // Fallback add to root?
                    this.rootContainer.addChild(container);
                }
            } else {
                this.rootContainer.addChild(container);
            }

            // Draw visual (Bone shape)
            if (bone.length > 0) {
                const gr = new PIXI.Graphics();
                const color = this.hexToNumber(bone.color || "989898"); // Default gray if no color

                // Draw Bone segment (Triangle-like shape)
                gr.lineStyle(1.5, color, 1);
                gr.beginFill(color, 0.3); // Semi-transparent fill

                // Shape: Start at 0,0 -> go out a bit wide -> go to length -> back to base
                const boneWidth = Math.min(bone.length / 5, 10); // Scale width with length but clamp it

                gr.moveTo(0, 0);
                gr.lineTo(boneWidth, -boneWidth);
                gr.lineTo(bone.length, 0);
                gr.lineTo(boneWidth, boneWidth);
                gr.lineTo(0, 0);

                gr.endFill();

                // joint circle
                gr.lineStyle(1, color, 1);
                gr.beginFill(color);
                gr.drawCircle(0, 0, 3);
                gr.endFill();

                container.addChild(gr);
            } else {
                // Root/0-length bone marker (Crosshair or just circle)
                const gr = new PIXI.Graphics();
                const color = this.hexToNumber(bone.color || "0000FF");

                gr.lineStyle(1, color, 1);
                gr.drawCircle(0, 0, 4);

                gr.moveTo(-5, 0);
                gr.lineTo(5, 0);
                gr.moveTo(0, -5);
                gr.lineTo(0, 5);

                container.addChild(gr);
            }
        });

        // Adjust scale
        this.rootContainer.scale.set(0.5, -0.5); // Flip Y to match standard Spine Y-up? 
        // Spine coordinate system: 0,0 is usually at feet. Y UP.
        // Pixi: 0,0 Top-Left. Y DOWN.
        // So scale Y should be -1.
    }

    private hexToNumber(hex: string): number {
        if (!hex) return 0xFFFFFF;
        // hex might be "RRGGBB" or "RRGGBBAA"
        // We only care about RGB for now
        return parseInt(hex.substring(0, 6), 16);
    }
}
