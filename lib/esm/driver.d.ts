import { MobilettoOrmRepository } from "mobiletto-orm";
import { MediaOperationType, MediaProfileType, MediaPropertyType, MediaType } from "yuebing-model";
import { ParsedProfile } from "./profile.js";
export type MediaPlugin = {
    applyProfile: (downloaded: string, driver: MediaDriver, profile: ParsedProfile, outDir: string) => Promise<ApplyProfileResponse>;
};
export type MediaDriver = {
    profiles: Record<string, ParsedProfile>;
    props: Record<string, object | string | number>;
    plugin: MediaPlugin;
};
export declare const registerMediaDriver: (media: MediaType, plugin: MediaPlugin, profileRepo: MobilettoOrmRepository<MediaProfileType>, operationRepo: MobilettoOrmRepository<MediaOperationType>, propRepo: MobilettoOrmRepository<MediaPropertyType>) => Promise<void>;
export type ApplyProfileResponse = {
    args?: string[];
    done?: boolean;
};
export declare const applyProfile: (downloaded: string, profile: ParsedProfile, outDir: string) => Promise<ApplyProfileResponse>;
