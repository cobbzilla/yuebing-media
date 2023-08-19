import { MobilettoOrmRepository } from "mobiletto-orm";
import {
    DestinationAssetType,
    MediaOperationType,
    MediaProfileType,
    MediaPropertyType,
    MediaType,
} from "yuebing-model";
import { ParsedProfile, parseProfile } from "./profile.js";

export type MediaPlugin = {
    transform: (
        asset: DestinationAssetType,
        driver: MediaDriver,
        profile: ParsedProfile,
        outDir: string,
    ) => Promise<string[]>;
};

export type MediaDriver = {
    profiles: Record<string, ParsedProfile>;
    props: Record<string, object | string | number>;
    plugin: MediaPlugin;
};

const MEDIA_DRIVERS: Record<string, MediaDriver> = {};

export const registerMediaDriver = async (
    media: MediaType,
    plugin: MediaPlugin,
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    operationRepo: MobilettoOrmRepository<MediaOperationType>,
    propRepo: MobilettoOrmRepository<MediaPropertyType>,
) => {
    const profiles = await profileRepo.safeFindBy("media", media.name);
    const parsedProfiles: ParsedProfile[] = [];
    for (const profile of profiles) {
        parsedProfiles.push(await parseProfile(profileRepo, operationRepo, profile));
    }
    const props = await propRepo.safeFindBy("media", media.name);
    const parsedProps: Record<string, object | string | number> = {};
    for (const prop of props) {
        parsedProps[prop.name] = prop.value ? JSON.parse(prop.value) : null;
    }
    MEDIA_DRIVERS[media.name] = {
        profiles: parsedProfiles,
        props: parsedProps,
        plugin,
    };
};

export const processProfile = async (
    asset: DestinationAssetType,
    profile: ParsedProfile,
    existingAssets: DestinationAssetType[],
    outDir: string,
): Promise<string[]> => {
    const driver = MEDIA_DRIVERS[profile.media];
    return driver.plugin.transform(asset, driver, profile, outDir);
};