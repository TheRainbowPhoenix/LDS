
// --- Interfaces ---

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
    transformMode?: string;
    skin?: boolean;
    color?: string; // hex
    children?: BoneData[];
}

export interface SlotData {
    name: string;
    bone: string;
    attachment?: string;
    color?: string;
    dark?: string;
    blend?: string;
}

export interface EventData {
    name: string;
    int?: number;
    float?: number;
    string?: string;
    audio?: string;
    volume?: number;
    balance?: number;
}

// Constraints
export interface IkConstraintData {
    name: string;
    order: number;
    skin?: boolean;
    bones: string[];
    target: string;
    mix: number;
    softness: number;
    bendPositive: boolean;
    compress: boolean;
    stretch: boolean;
    uniform: boolean;
}

export interface TransformConstraintData {
    name: string;
    order: number;
    skin?: boolean;
    bones: string[];
    target: string;
    rotation: number;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    shearY: number;
    rotateMix: number;
    translateMix: number;
    scaleMix: number;
    shearMix: number;
    local: boolean;
    relative: boolean;
}

export interface PathConstraintData {
    name: string;
    order: number;
    skin?: boolean;
    bones: string[];
    target: string;
    positionMode: string;
    spacingMode: string;
    rotateMode: string;
    offsetRotation: number;
    position: number;
    spacing: number;
    rotateMix: number;
    translateMix: number;
}

// Attachments
export enum AttachmentType {
    Region,
    BoundingBox,
    Mesh,
    LinkedMesh,
    Path,
    Point,
    Clipping
}

export interface AttachmentData {
    name: string;
    type: AttachmentType;
    // Common
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    width?: number;
    height?: number;
    color?: string;
    // Mesh/Path specific
    vertices?: number[]; // interleaved x,y for basic, or weighted
    uvs?: number[];
    triangles?: number[];
    hull?: number; // for mesh
    edges?: number[];
    // Path
    closed?: boolean;
    constantSpeed?: boolean;
    lengths?: number[];
    // Clipping
    end?: string;
}

export interface SkinData {
    name: string;
    attachments: Map<string, Map<string, AttachmentData>>; // SlotName -> AttachmentName -> Data
}

// Animations
export interface AnimationKeyframe {
    time: number;
    curve?: number | string | number[]; // "stepped", "linear", or bezier array
    [key: string]: any;
}

export interface AnimationData {
    name: string;
    slots: Map<string, AnimationKeyframe[]>; // SlotName -> Timelines
    bones: Map<string, AnimationKeyframe[]>; // BoneName -> Timelines
    ik: Map<string, AnimationKeyframe[]>;
    transform: Map<string, AnimationKeyframe[]>;
    path: Map<string, AnimationKeyframe[]>;
    events: AnimationKeyframe[];
    drawOrder: AnimationKeyframe[];
    deform: Map<string, Map<string, AnimationKeyframe[]>>; // Skin -> Slot -> Timelines
}

export interface SpineData {
    bones: BoneData[];
    slots: SlotData[];
    skins: SkinData[];
    events: EventData[];
    animations: AnimationData[];
    ikConstraints: IkConstraintData[];
    transformConstraints: TransformConstraintData[];
    pathConstraints: PathConstraintData[];
}

// Atlas
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
        // --- Bones ---
        const bones: BoneData[] = (json.bones || []).map((b: any) => ({
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
            transformMode: b.transform,
            skin: b.skin,
            color: b.color,
            children: []
        }));

        // Build bone hierarchy
        const boneMap = new Map<string, BoneData>();
        bones.forEach(b => boneMap.set(b.name, b));
        bones.forEach(b => {
            if (b.parent) {
                const parent = boneMap.get(b.parent);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(b);
                }
            }
        });

        // --- Slots ---
        const slots: SlotData[] = (json.slots || []).map((s: any) => ({
            name: s.name,
            bone: s.bone,
            attachment: s.attachment,
            color: s.color,
            dark: s.dark,
            blend: s.blend
        }));

        // --- Constraints ---
        const ikConstraints: IkConstraintData[] = (json.ik || []).map((ik: any) => ({
            name: ik.name,
            order: ik.order,
            skin: ik.skin,
            bones: ik.bones || [],
            target: ik.target,
            mix: ik.mix !== undefined ? ik.mix : 1,
            softness: ik.softness || 0,
            bendPositive: ik.bendPositive !== undefined ? ik.bendPositive : true,
            compress: ik.compress,
            stretch: ik.stretch,
            uniform: ik.uniform
        }));

        const transformConstraints: TransformConstraintData[] = (json.transform || []).map((tc: any) => ({
            name: tc.name,
            order: tc.order,
            skin: tc.skin,
            bones: tc.bones || [],
            target: tc.target,
            rotation: tc.rotation || 0,
            x: tc.x || 0,
            y: tc.y || 0,
            scaleX: tc.scaleX || 0,
            scaleY: tc.scaleY || 0,
            shearY: tc.shearY || 0,
            rotateMix: tc.rotateMix !== undefined ? tc.rotateMix : 1,
            translateMix: tc.translateMix !== undefined ? tc.translateMix : 1,
            scaleMix: tc.scaleMix !== undefined ? tc.scaleMix : 1,
            shearMix: tc.shearMix !== undefined ? tc.shearMix : 1,
            local: tc.local,
            relative: tc.relative
        }));

        const pathConstraints: PathConstraintData[] = (json.path || []).map((pc: any) => ({
            name: pc.name,
            order: pc.order,
            skin: pc.skin,
            bones: pc.bones || [],
            target: pc.target,
            positionMode: pc.positionMode || 'percent',
            spacingMode: pc.spacingMode || 'length',
            rotateMode: pc.rotateMode || 'tangent',
            offsetRotation: pc.offsetRotation || 0,
            position: pc.position || 0,
            spacing: pc.spacing || 0,
            rotateMix: pc.rotateMix !== undefined ? pc.rotateMix : 1,
            translateMix: pc.translateMix !== undefined ? pc.translateMix : 1
        }));

        // --- Skins ---
        const skins: SkinData[] = (json.skins || []).map((s: any) => {
            const attachmentsMap = new Map<string, Map<string, AttachmentData>>();
            if (s.attachments) {
                // Spine 3.8+ format: { attachments: { slotName: { attachmentName: { ... } } } }
                // Or sometimes flat? Assuming 3.8 standard structure
                for (const slotName in s.attachments) {
                    const slotMap = new Map<string, AttachmentData>();
                    const slotAttachments = s.attachments[slotName];
                    for (const attName in slotAttachments) {
                        const att = slotAttachments[attName];
                        const typeStr = att.type || 'region';
                        let type = AttachmentType.Region;
                        if (typeStr === 'mesh') type = AttachmentType.Mesh;
                        else if (typeStr === 'linkedmesh') type = AttachmentType.LinkedMesh;
                        else if (typeStr === 'boundingbox') type = AttachmentType.BoundingBox;
                        else if (typeStr === 'path') type = AttachmentType.Path;
                        else if (typeStr === 'point') type = AttachmentType.Point;
                        else if (typeStr === 'clipping') type = AttachmentType.Clipping;

                        slotMap.set(attName, {
                            name: att.name || attName,
                            type: type,
                            x: att.x,
                            y: att.y,
                            scaleX: att.scaleX,
                            scaleY: att.scaleY,
                            rotation: att.rotation,
                            width: att.width,
                            height: att.height,
                            color: att.color,
                            vertices: att.vertices,
                            uvs: att.uvs,
                            triangles: att.triangles,
                            hull: att.hull,
                            edges: att.edges,
                            closed: att.closed,
                            constantSpeed: att.constantSpeed,
                            lengths: att.lengths,
                            end: att.end
                        });
                    }
                    attachmentsMap.set(slotName, slotMap);
                }
            }
            return {
                name: s.name,
                attachments: attachmentsMap
            };
        });

        // --- Events ---
        const events: EventData[] = json.events ? Object.keys(json.events).map(k => {
            const e = json.events[k];
            return {
                name: k,
                int: e.int,
                float: e.float,
                string: e.string,
                audio: e.audio,
                volume: e.volume,
                balance: e.balance
            };
        }) : [];

        // --- Animations ---
        const animations: AnimationData[] = json.animations ? Object.keys(json.animations).map(k => {
            const a = json.animations[k];

            const parseTimelines = (raw: any): Map<string, AnimationKeyframe[]> => {
                const map = new Map<string, AnimationKeyframe[]>();
                if (!raw) return map;
                for (const key in raw) {
                    map.set(key, raw[key]);
                }
                return map;
            };

            return {
                name: k,
                slots: parseTimelines(a.slots),
                bones: parseTimelines(a.bones),
                ik: parseTimelines(a.ik),
                transform: parseTimelines(a.transform),
                path: parseTimelines(a.path),
                events: a.events || [],
                drawOrder: a.drawOrder || [],
                deform: new Map() // Complex structure, skip for MVP brevity or map raw
            };
        }) : [];


        return {
            bones,
            slots,
            skins,
            events,
            animations,
            ikConstraints,
            transformConstraints,
            pathConstraints
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

                if (reader.readTuple(tuple) == 2) {
                    page.width = parseInt(tuple[0]);
                    page.height = parseInt(tuple[1]);
                    reader.readTuple(tuple);
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

                if (reader.readTuple(tuple) == 4) {
                    if (reader.readTuple(tuple) == 4) {
                        reader.readTuple(tuple);
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
