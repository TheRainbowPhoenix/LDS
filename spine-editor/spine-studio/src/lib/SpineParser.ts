import { SkeletonData } from './spine/core/SkeletonData';
import { SkeletonJson } from './spine/core/SkeletonJson';
import { AtlasAttachmentLoader } from './spine/core/AtlasAttachmentLoader';
import { type AttachmentLoader } from './spine/core/attachments/AttachmentLoader';
import { type Skin } from './spine/core/Skin';
import { RegionAttachment } from './spine/core/attachments/RegionAttachment';
import { MeshAttachment } from './spine/core/attachments/MeshAttachment';
import { BoundingBoxAttachment } from './spine/core/attachments/BoundingBoxAttachment';
import { PathAttachment } from './spine/core/attachments/PathAttachment';
import { PointAttachment } from './spine/core/attachments/PointAttachment';
import { ClippingAttachment } from './spine/core/attachments/ClippingAttachment';
import { TextureRegion } from './spine/core/Texture';

// Legacy Atlas Interfaces kept for compatibility with existing codebase
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

class ParserAttachmentLoader implements AttachmentLoader {
    constructor(private atlas: AtlasData) { }

    newRegionAttachment(skin: Skin, name: string, path: string): RegionAttachment | null {
        let attachment = new RegionAttachment(name);
        let region = this.findRegion(path);
        if (region) {
            attachment.setRegion(region);
        }
        return attachment;
    }

    newMeshAttachment(skin: Skin, name: string, path: string): MeshAttachment | null {
        let attachment = new MeshAttachment(name);
        let region = this.findRegion(path);
        if (region) {
            attachment.region = region;
        }
        return attachment;
    }

    newBoundingBoxAttachment(skin: Skin, name: string): BoundingBoxAttachment | null {
        return new BoundingBoxAttachment(name);
    }

    newPathAttachment(skin: Skin, name: string): PathAttachment | null {
        return new PathAttachment(name);
    }

    newPointAttachment(skin: Skin, name: string): PointAttachment | null {
        return new PointAttachment(name);
    }

    newClippingAttachment(skin: Skin, name: string): ClippingAttachment | null {
        return new ClippingAttachment(name);
    }

    private findRegion(name: string): TextureRegion | null {
        let atlasRegion = this.atlas.regions.find(r => r.name === name);
        if (!atlasRegion) return null;

        let page = this.atlas.pages.find(p => p.name === atlasRegion!.page);
        if (!page) return null;

        let region = new TextureRegion();
        region.width = atlasRegion.width;
        region.height = atlasRegion.height;
        region.originalWidth = atlasRegion.originalWidth;
        region.originalHeight = atlasRegion.originalHeight;
        region.offsetX = atlasRegion.offsetX;
        region.offsetY = atlasRegion.offsetY;
        region.rotate = atlasRegion.rotate;

        // Calculate UVs
        region.u = atlasRegion.x / page.width;
        region.v = atlasRegion.y / page.height;
        if (region.rotate) {
            region.u2 = (atlasRegion.x + atlasRegion.height) / page.width;
            region.v2 = (atlasRegion.y + atlasRegion.width) / page.height;
        } else {
            region.u2 = (atlasRegion.x + atlasRegion.width) / page.width;
            region.v2 = (atlasRegion.y + atlasRegion.height) / page.height;
        }
        return region;
    }
}

export class SpineParser {
    static parseSkeleton(json: any, atlas: AtlasData): SkeletonData {
        let loader = new ParserAttachmentLoader(atlas);
        let parser = new SkeletonJson(loader);
        return parser.readSkeletonData(json);
    }

    static parseAtlas(atlasText: string): AtlasData {
        const pages: AtlasPage[] = [];
        const regions: AtlasRegion[] = [];
        const lines = atlasText.split(/\r\n|\r|\n/);

        let page: AtlasPage | null = null;
        let region: AtlasRegion | null = null;

        let index = 0;
        const readLine = () => lines[index++]?.trim();

        while (index < lines.length) {
            let line = readLine();
            if (!line) {
                page = null;
                region = null;
                continue;
            }

            if (!page) { // Start of page
                page = {
                    name: line,
                    width: 0, height: 0,
                    minFilter: 'Linear', magFilter: 'Linear',
                    uWrap: 'ClampToEdge', vWrap: 'ClampToEdge'
                };
                pages.push(page);
                while (true) {
                    let prop = lines[index]; // Peek
                    if (!prop || prop.indexOf(':') === -1) break;
                    prop = readLine();
                    let p = prop.split(':');
                    let key = p[0].trim();
                    let val = p[1].trim();
                    if (key == 'size') {
                        let s = val.split(',');
                        page.width = parseInt(s[0]);
                        page.height = parseInt(s[1]);
                    } else if (key == 'filter') {
                        let s = val.split(',');
                        page.minFilter = s[0].trim();
                        page.magFilter = s[1].trim();
                    }
                }
            } else { // Region
                region = {
                    name: line,
                    page: page.name,
                    x: 0, y: 0,
                    width: 0, height: 0,
                    offsetX: 0, offsetY: 0,
                    originalWidth: 0, originalHeight: 0,
                    rotate: false, degrees: 0, index: -1
                };
                let propLine = "";
                while (index < lines.length && (propLine = lines[index]).indexOf(':') !== -1) {
                    readLine(); // Consume
                    let p = propLine.split(':');
                    let key = p[0].trim();
                    let val = p[1].trim();
                    if (key == 'rotate') {
                        region.rotate = val == 'true';
                        if (val == 'true') region.degrees = 90;
                    } else if (key == 'xy') {
                        let s = val.split(',');
                        region.x = parseInt(s[0]);
                        region.y = parseInt(s[1]);
                    } else if (key == 'size') {
                        let s = val.split(',');
                        region.width = parseInt(s[0]);
                        region.height = parseInt(s[1]);
                    } else if (key == 'orig') {
                        let s = val.split(',');
                        region.originalWidth = parseInt(s[0]);
                        region.originalHeight = parseInt(s[1]);
                    } else if (key == 'offset') {
                        let s = val.split(',');
                        region.offsetX = parseInt(s[0]);
                        region.offsetY = parseInt(s[1]);
                    } else if (key == 'index') {
                        region.index = parseInt(val);
                    }
                }
                regions.push(region);
            }
        }

        return { pages, regions };
    }
}
