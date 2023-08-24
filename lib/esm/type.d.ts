import { MediaProfileType } from "yuebing-model";
import { MobilettoConnection } from "mobiletto-base";
import { ParsedProperties } from "./driver";
import { MobilettoOrmTypeDef } from "mobiletto-orm-typedef";
export type ApplyProfileResponse = {
    args?: string[];
    analysis?: object | string | number | boolean;
};
export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    additionalAssetsRegexes?: RegExp[];
    operationConfigObject?: Record<string, string | number | boolean | object>;
};
export type MediaOperationFunc = (downloaded: string, profile: ParsedProfile, outDir: string, sourcePath: string, conn: MobilettoConnection) => Promise<ApplyProfileResponse>;
export type MediaPlugin = {
    applyProfile: MediaOperationFunc;
    operationConfigType: (operation: string, parsedProps: ParsedProperties) => MobilettoOrmTypeDef;
};
