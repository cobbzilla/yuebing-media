import { MobilettoOrmRepository } from "mobiletto-orm";
import { MediaOperationType, MediaProfileType, MediaPropertyType, MediaType } from "yuebing-model";
import { ApplyProfileResponse, MediaDriver, MediaPlugin, ParsedProfile } from "./type.js";
import { parseProfile } from "./profile.js";

const MEDIA_DRIVERS: Record<string, MediaDriver> = {};

const MEDIA_PROFILES: Record<string, ParsedProfile> = {};

export const registerMediaDriver = async (
    media: MediaType,
    plugin: MediaPlugin,
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    operationRepo: MobilettoOrmRepository<MediaOperationType>,
    propRepo: MobilettoOrmRepository<MediaPropertyType>,
) => {
    const operations = (await operationRepo.safeFindBy("media", media.name)) as MediaOperationType[];
    const profiles = (await profileRepo.safeFindBy("media", media.name)) as MediaProfileType[];
    for (const profile of profiles) {
        const parsed = await parseProfile(profileRepo, operations, profile, plugin);
        if (parsed) {
            MEDIA_PROFILES[parsed.name] = parsed;
        }
    }
    const props = (await propRepo.safeFindBy("media", media.name)) as MediaPropertyType[];
    const parsedProps: Record<string, object | string | number> = {};
    for (const prop of props) {
        parsedProps[prop.name] = prop.value ? JSON.parse(prop.value) : null;
    }
    MEDIA_DRIVERS[media.name] = {
        operations,
        props: parsedProps,
        plugin,
    };
};

export const applyProfile = async (
    downloaded: string,
    media: string,
    profileName: string,
    outDir: string,
): Promise<ApplyProfileResponse> => {
    const profile = MEDIA_PROFILES[profileName];
    const driver = MEDIA_DRIVERS[media];
    return driver.plugin.applyProfile(downloaded, profile, driver.props, outDir);
};
