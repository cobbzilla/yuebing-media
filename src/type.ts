import { MediaProfileType } from "yuebing-model";
import { MobilettoOrmTypeDef } from "mobiletto-orm";
import { ParsedProperties } from "./driver";
import { MobilettoConnection } from "mobiletto-base";

export type ApplyProfileResponse = {
    args?: string[];
    analysis?: object | string | number | boolean;
};

export type MediaProperties = Record<string, object | string | number | boolean>;

export type MediaOperation = {
    name: string;
    analysis?: boolean;
    command?: string;
    func?: boolean;
    minFileSize: number;
};

export type MediaOperationConfig = Record<string, string | number | boolean>;

export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    additionalAssetsRegexes?: RegExp[];
};

export type MediaOperationFunc = (
    downloaded: string,
    profile: ParsedProfile,
    outDir: string,
    sourcePath: string,
    conn: MobilettoConnection,
) => Promise<ApplyProfileResponse>;

export type MediaPlugin = {
    applyProfile: MediaOperationFunc;
    operationConfigType: (operation: MediaOperation, parsedProps: ParsedProperties) => MobilettoOrmTypeDef;
};
