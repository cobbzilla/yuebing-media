import { MobilettoConnection } from "mobiletto-base";
import { MobilettoOrmRepository } from "mobiletto-orm";
import { MediaProfileType, MediaType, ProfileJobType } from "yuebing-model";
import { ApplyProfileResponse, MediaPlugin, ParsedProfile } from "./type.js";
export declare const registerMediaPlugin: (plugin: MediaPlugin, mediaRepo: MobilettoOrmRepository<MediaType>, profileRepo: MobilettoOrmRepository<MediaProfileType>) => Promise<boolean>;
export declare const updateMediaProfile: (plugin: MediaPlugin, profile: MediaProfileType, profileRepo: MobilettoOrmRepository<MediaProfileType>) => Promise<void>;
export declare const loadProfile: (name: string) => ParsedProfile;
export declare const applyProfile: (downloaded: string, media: string, profileName: string, outDir: string, sourcePath: string, conn: MobilettoConnection, analysisResults: ProfileJobType[]) => Promise<ApplyProfileResponse>;