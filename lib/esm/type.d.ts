import { MobilettoConnection } from "mobiletto-base";
import { MobilettoOrmTypeDef } from "mobiletto-orm-typedef";
import { MediaProfileType, MediaType, ProfileJobType } from "yuebing-model";
import { MediaOperationType } from "./type/MediaOperationType.js";
export type ApplyProfileResponse = {
    args?: string[];
    result?: object | string | number | boolean;
    upload?: boolean;
};
export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    additionalAssetsRegexes?: RegExp[];
    operationObject: MediaOperationType;
    operationConfigObject?: Record<string, string | number | boolean | object>;
};
export type MediaOperationFunc = (downloaded: string, profile: ParsedProfile, outDir: string, sourcePath: string, conn?: MobilettoConnection, analysisResults?: ProfileJobType[]) => Promise<ApplyProfileResponse>;
export declare const MediaOperationTypeDef: MobilettoOrmTypeDef;
export type MediaPlugin = {
    media?: MediaType;
    operations: () => Record<string, MediaOperationType>;
    operationFunction: (op: string) => MediaOperationFunc;
    operationConfigType: (operation: string) => MobilettoOrmTypeDef | undefined;
    defaultProfiles: () => MediaProfileType[];
};
