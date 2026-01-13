/* eslint-disable spaced-comment */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference

import '../loader-base'; // Side effect install atlas loader
// eslint-disable-next-line @typescript-eslint/no-duplicate-imports
import { type ISpineResource, SpineLoaderAbstract } from '../loader-base';
import type { ISkeletonParser, TextureAtlas } from '../base';
import { AtlasAttachmentLoader, SkeletonBinary, SkeletonData, SkeletonJson } from '../runtime-3.8';

/**
 * @internal
 */
export class SpineParser extends SpineLoaderAbstract<SkeletonData> {
    createBinaryParser(): ISkeletonParser {
        return new SkeletonBinary(null);
    }

    createJsonParser(): ISkeletonParser {
        return new SkeletonJson(null);
    }

    parseData(parser: ISkeletonParser, atlas: TextureAtlas, dataToParse: any): ISpineResource<SkeletonData> {
        const parserCast = parser as SkeletonBinary | SkeletonJson;

        parserCast.attachmentLoader = new AtlasAttachmentLoader(atlas);

        return {
            spineData: parserCast.readSkeletonData(dataToParse),
            spineAtlas: atlas,
        };
    }
}

new SpineParser().installLoader();
