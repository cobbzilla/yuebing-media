import { MobilettoOrmRepository } from "mobiletto-orm";
import { DestinationAssetType, MediaOperationType, MediaProfileType, MediaPropertyType, MediaType } from "yuebing-model";
import { ParsedProfile } from "./profile.js";
export type MediaPlugin = {
    profileCommandArgs: (asset: DestinationAssetType, driver: MediaDriver, profile: ParsedProfile, outDir: string) => Promise<string[]>;
};
export type MediaDriver = {
    profiles: Record<string, ParsedProfile>;
    props: Record<string, object | string | number>;
    plugin: MediaPlugin;
};
export declare const registerMediaDriver: (media: MediaType, plugin: MediaPlugin, profileRepo: MobilettoOrmRepository<MediaProfileType>, operationRepo: MobilettoOrmRepository<MediaOperationType>, propRepo: MobilettoOrmRepository<MediaPropertyType>) => Promise<void>;
export declare const profileCommandArguments: (asset: DestinationAssetType, profile: ParsedProfile, existingAssets: DestinationAssetType[], outDir: string) => Promise<string[]>;
