
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

export interface AtlasRegion {
    name: string;
    page: string;
    x: number;
    y: number;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    originalWidth: number;
    originalHeight: number;
    rotate: boolean;
    degrees: number;
    index: number;
}

export interface AtlasPage {
    name: string;
    width: number;
    height: number;
    minFilter: string;
    magFilter: string;
    uWrap: string;
    vWrap: string;
}

export interface AtlasData {
    pages: AtlasPage[];
    regions: AtlasRegion[];
}

class TextureAtlasReader {
    lines: Array<string>;
    index: number = 0;

    constructor(text: string) {
        this.lines = text.split(/\r\n|\r|\n/);
    }

    readLine(): string | null {
        if (this.index >= this.lines.length)
            return null;
        return this.lines[this.index++];
    }

    readValue(): string {
        let line = this.readLine();
        let colon = line!.indexOf(":");
        if (colon == -1)
            throw new Error("Invalid line: " + line);
        return line!.substring(colon + 1).trim();
    }

    readTuple(tuple: Array<string>): number {
        let line = this.readLine();
        let colon = line!.indexOf(":");
        if (colon == -1)
            throw new Error("Invalid line: " + line);
        let i = 0, lastMatch = colon + 1;
        for (; i < 3; i++) {
            let comma = line!.indexOf(",", lastMatch);
            if (comma == -1) break;
            tuple[i] = line!.substring(lastMatch, comma).trim();
            lastMatch = comma + 1;
        }
        tuple[i] = line!.substring(lastMatch).trim();
        return i + 1;
    }
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

    static parseAtlas(atlasText: string): AtlasData {
        const reader = new TextureAtlasReader(atlasText);
        const tuple = new Array<string>(4);
        let page: AtlasPage | null = null;
        const pages: AtlasPage[] = [];
        const regions: AtlasRegion[] = [];

        while (true) {
            let line = reader.readLine();
            if (line == null) break;
            line = line.trim();
            if (line.length == 0) {
                page = null;
            } else if (!page) {
                page = {
                    name: line,
                    width: 0,
                    height: 0,
                    minFilter: '',
                    magFilter: '',
                    uWrap: 'ClampToEdge',
                    vWrap: 'ClampToEdge'
                };

                if (reader.readTuple(tuple) == 2) { // size is only optional for an atlas packed with an old TexturePacker.
                    page.width = parseInt(tuple[0]);
                    page.height = parseInt(tuple[1]);
                    reader.readTuple(tuple); // format
                }

                reader.readTuple(tuple);
                page.minFilter = tuple[0];
                page.magFilter = tuple[1];

                let direction = reader.readValue();
                if (direction == "x")
                    page.uWrap = 'Repeat';
                else if (direction == "y")
                    page.vWrap = 'Repeat';
                else if (direction == "xy") {
                    page.uWrap = 'Repeat';
                    page.vWrap = 'Repeat';
                }

                pages.push(page);
            } else {
                const region: AtlasRegion = {
                    name: line,
                    page: page.name,
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    offsetX: 0,
                    offsetY: 0,
                    originalWidth: 0,
                    originalHeight: 0,
                    rotate: false,
                    degrees: 0,
                    index: -1
                };

                let rotateValue = reader.readValue();
                if (rotateValue.toLocaleLowerCase() == "true") {
                    region.degrees = 90;
                } else if (rotateValue.toLocaleLowerCase() == "false") {
                    region.degrees = 0;
                } else {
                    region.degrees = parseFloat(rotateValue);
                }
                region.rotate = region.degrees == 90;

                reader.readTuple(tuple);
                region.x = parseInt(tuple[0]);
                region.y = parseInt(tuple[1]);

                reader.readTuple(tuple);
                region.width = Math.abs(parseInt(tuple[0]));
                region.height = Math.abs(parseInt(tuple[1]));

                if (reader.readTuple(tuple) == 4) { // split is optional
                    if (reader.readTuple(tuple) == 4) { // pad is optional, but only present with splits
                        reader.readTuple(tuple); // orig
                    }
                }

                region.originalWidth = parseInt(tuple[0]);
                region.originalHeight = parseInt(tuple[1]);

                reader.readTuple(tuple);
                region.offsetX = parseInt(tuple[0]);
                region.offsetY = parseInt(tuple[1]);

                region.index = parseInt(reader.readValue());

                regions.push(region);
            }
        }

        return { pages, regions };
    }
}
