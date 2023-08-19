import { DestinationAssetType, MediaOperationType, MediaProfileType, MediaPropertyType, MediaType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";
import { ParsedProfile } from "./profile";
export type MediaPlugin = {
    transform: (asset: DestinationAssetType, driver: MediaDriver, profile: ParsedProfile, outDir: string) => DestinationAssetType;
};
export type MediaDriver = {
    profiles: Record<string, ParsedProfile>;
    props: Record<string, object | string | number>;
    plugin: MediaPlugin;
};
export declare const registerMediaDriver: (media: MediaType, plugin: MediaPlugin, profileRepo: MobilettoOrmRepository<MediaProfileType>, operationRepo: MobilettoOrmRepository<MediaOperationType>, propRepo: MobilettoOrmRepository<MediaPropertyType>) => Promise<void>;
