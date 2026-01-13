
export interface BoneData {
    name: string;
    parent?: string;
    length: number;
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
    color?: string; // hex
    children?: BoneData[];
}

export interface SlotData {
    name: string;
    bone: string;
    attachment?: string;
    color?: string;
}

export interface SpineData {
    bones: BoneData[];
    slots: SlotData[];
    // Initial implementation focuses on bones
}

export class SpineParser {
    static parseSkeleton(json: any): SpineData {
        const bones: BoneData[] = json.bones.map((b: any) => ({
            name: b.name,
            parent: b.parent,
            length: b.length || 0,
            x: b.x || 0,
            y: b.y || 0,
            rotation: b.rotation || 0,
            scaleX: b.scaleX !== undefined ? b.scaleX : 1,
            scaleY: b.scaleY !== undefined ? b.scaleY : 1,
            shearX: b.shearX || 0,
            shearY: b.shearY || 0,
            color: b.color,
            children: []
        }));

        // Build hierarchy
        const boneMap = new Map<string, BoneData>();
        bones.forEach(b => boneMap.set(b.name, b));

        const rootBones: BoneData[] = [];
        bones.forEach(b => {
            if (b.parent) {
                const parent = boneMap.get(b.parent);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(b);
                }
            } else {
                rootBones.push(b);
            }
        });

        const slots: SlotData[] = json.slots ? json.slots.map((s: any) => ({
            name: s.name,
            bone: s.bone,
            attachment: s.attachment,
            color: s.color
        })) : [];

        return {
            bones: bones, // Return flat list for easy lookup, or rootBones if we want tree
            slots: slots,
        };
    }

    static parseAtlas(atlasText: string): any {
        // Placeholder for Atlas parsing
        console.log("Parsing atlas...", atlasText.substring(0, 50));
        return {};
    }
}
