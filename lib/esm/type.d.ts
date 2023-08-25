import { MobilettoConnection } from "mobiletto-base";
import { MobilettoOrmTypeDef } from "mobiletto-orm-typedef";
import { MediaProfileType } from "yuebing-model";
import { MediaOperationType } from "./type/MediaOperationType.js";
export type ApplyProfileResponse = {
    args?: string[];
    result?: object | string | number | boolean;
};
export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    additionalAssetsRegexes?: RegExp[];
    operationObject: MediaOperationType;
    operationConfigObject?: Record<string, string | number | boolean | object>;
};
export type MediaOperationFunc = (downloaded: string, profile: ParsedProfile, outDir: string, sourcePath: string, conn: MobilettoConnection) => Promise<ApplyProfileResponse>;
export declare const MediaOperationTypeDef: MobilettoOrmTypeDef;
export type MediaPlugin = {
    applyProfile: MediaOperationFunc;
    operations: Record<string, MediaOperationType>;
    operationConfigType: (operation: string) => MobilettoOrmTypeDef;
};
