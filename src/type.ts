import { MediaOperationType, MediaProfileType } from "yuebing-model";
import { MobilettoOrmTypeDef } from "mobiletto-orm";
import { ParsedProperties } from "./driver";

export type ApplyProfileResponse = {
    args?: string[];
    analysis?: object | string | number | boolean;
};

export type MediaPlugin = {
    applyProfile: (
        downloaded: string,
        profile: ParsedProfile,
        props: MediaProperties,
        outDir: string,
    ) => Promise<ApplyProfileResponse>;
    operationConfigType: (operation: MediaOperationType, parsedProps: ParsedProperties) => MobilettoOrmTypeDef;
};

export type MediaProperties = Record<string, object | string | number | boolean>;

export type MediaDriver = {
    operations: MediaOperationType[];
    props: MediaProperties;
    plugin: MediaPlugin;
};

export type MediaOperationConfig = Record<string, string | number | boolean>;

export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    additionalAssetsRegexes?: RegExp[];
    operationObject?: MediaOperationType;
    operationConfigType?: MobilettoOrmTypeDef;
    operationConfig?: MediaOperationConfig;
};

export type MediaOperationFunc = (
    infile: string,
    profile: ParsedProfile,
    props: MediaProperties,
    outfile: string,
) => Promise<ApplyProfileResponse>;
