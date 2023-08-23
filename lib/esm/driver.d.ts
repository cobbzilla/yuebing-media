import { MobilettoOrmRepository } from "mobiletto-orm";
import { MediaOperationType, MediaProfileType, MediaPropertyType, MediaType } from "yuebing-model";
import { ApplyProfileResponse, MediaPlugin, ParsedProfile } from "./type.js";
export type ParsedProperties = Record<string, object | string | number>;
export declare const registerMediaDriver: (media: MediaType, plugin: MediaPlugin, profileRepo: MobilettoOrmRepository<MediaProfileType>, operationRepo: MobilettoOrmRepository<MediaOperationType>, propRepo: MobilettoOrmRepository<MediaPropertyType>) => Promise<void>;
export declare const loadProfile: (name: string) => ParsedProfile;
export declare const applyProfile: (downloaded: string, media: string, profileName: string, outDir: string) => Promise<ApplyProfileResponse>;
export declare const destinationProfilePath: (sourceAsset: string, media: string, profile: string) => string;
export declare const destinationPath: (sourceAsset: string, media: string, profile: string, filename: string) => string;
