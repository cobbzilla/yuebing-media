import { MobilettoConnection } from "mobiletto-base";
import { MobilettoOrmTypeDef } from "mobiletto-orm-typedef";
import { MediaProfileType, MediaType, ProfileJobType } from "yuebing-model";
import { MediaOperationType } from "./type/MediaOperationType.js";

export type ApplyProfileResponse = {
    args?: string[];
    result?: object | string | number | boolean;
    // normally analysis results are stored in the job object, not uploaded
    // if you return this flag=true, then yuebing-scan will upload analysis assets
    // before beginning transform profiles
    upload?: boolean;
};

export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    additionalAssetsRegexes?: RegExp[];
    operationObject: MediaOperationType;
    operationConfigObject?: Record<string, string | number | boolean | object>;
};

export type MediaOperationFunc = (
    downloaded: string,
    profile: ParsedProfile,
    outDir: string,
    sourcePath: string,
    conn?: MobilettoConnection,
    analysisResults?: ProfileJobType[],
) => Promise<ApplyProfileResponse>;

export const MediaOperationTypeDef: MobilettoOrmTypeDef = new MobilettoOrmTypeDef({
    typeName: "MediaOperation",
    fields: {
        name: { required: true, type: "string" },
        analysis: { default: false },
        command: { type: "string" },
        func: { default: false },
        minFileSize: { required: true, default: 0 },
    },
    validations: {
        must_define_command_or_func: {
            field: "command",
            valid: (v) =>
                (typeof v.command === "string" && v.command.length > 0) || (typeof v.func === "boolean" && v.func),
        },
    },
});

export type MediaPlugin = {
    media?: MediaType;
    operations: () => Record<string, MediaOperationType>;
    operationFunction: (op: string) => MediaOperationFunc;
    operationConfigType: (operation: string) => MobilettoOrmTypeDef | undefined;
    defaultProfiles: () => MediaProfileType[];
};
