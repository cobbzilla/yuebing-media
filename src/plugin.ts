import { MobilettoConnection } from "mobiletto-base";
import { mergeDeep, MobilettoOrmRepository } from "mobiletto-orm";
import { MediaProfileType, MediaType, ProfileJobType } from "yuebing-model";
import { ApplyProfileResponse, MediaPlugin, ParsedProfile } from "./type.js";

const MEDIA_PLUGINS: Record<string, MediaPlugin> = {};

const MEDIA_PROFILES: Record<string, ParsedProfile> = {};

export const registerMediaPlugin = async (
    plugin: MediaPlugin,
    mediaRepo: MobilettoOrmRepository<MediaType>,
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
): Promise<ParsedProfile[]> => {
    if (!plugin.media) {
        throw new Error(`registerMediaPlugin: plugin.media was undefined. plugin=${JSON.stringify(plugin)}`);
    }
    if (plugin.initialize) plugin.initialize();

    // load media
    let media = await mediaRepo.safeFindById(plugin.media.name);
    if (media) {
        console.warn(`registerMediaPlugin: plugin for media=${plugin.media.name} already registered`);
    } else {
        media = await mediaRepo.create(plugin.media);
    }

    // load profiles
    const profiles = (await profileRepo.safeFindBy("media", media.name)) as MediaProfileType[];
    const parsedProfiles: ParsedProfile[] = [];
    if (!profiles || profiles.length === 0) {
        for (const profile of plugin.defaultProfiles()) {
            const parsed = await parseProfile(profileRepo, profile, plugin);
            const created = await profileRepo.create(parsed);
            MEDIA_PROFILES[created.name] = await parseProfile(profileRepo, created, plugin);
            parsedProfiles.push(MEDIA_PROFILES[created.name]);
        }
    } else {
        for (const profile of profiles) {
            const parsed = await parseProfile(profileRepo, profile, plugin);
            MEDIA_PROFILES[parsed.name] = parsed;
            parsedProfiles.push(parsed);
        }
    }
    MEDIA_PLUGINS[media.name] = plugin;
    return parsedProfiles;
};

export const updateMediaProfile = async (
    plugin: MediaPlugin,
    profile: MediaProfileType,
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
) => {
    if (!plugin.media) {
        throw new Error(`updateMediaProfile: plugin.media was undefined. plugin=${JSON.stringify(plugin)}`);
    }
    profile.media = plugin.media.name;
    const existing = await profileRepo.safeFindById(profile.name);
    if (existing) {
        const parsed = await parseProfile(profileRepo, profile, plugin);
        const update: MediaProfileType = Object.assign({}, existing, parsed);
        profile = await profileRepo.update(update);
    } else {
        const parsed = await parseProfile(profileRepo, profile, plugin);
        profile = await profileRepo.create(parsed);
    }
    const finalizedProfile = await parseProfile(profileRepo, profile, plugin);
    MEDIA_PROFILES[profile.name] = finalizedProfile;
    return finalizedProfile;
};

const parseProfile = async (
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    profile: MediaProfileType | string,
    plugin: MediaPlugin,
): Promise<ParsedProfile> => {
    const prof: MediaProfileType = typeof profile === "string" ? await profileRepo.findById(profile) : profile;
    if (plugin.media) prof.media = plugin.media.name;

    let fromProfile: ParsedProfile | null = null;
    if (prof.from) {
        const fromProfileObj = await profileRepo.findById(prof.from);
        fromProfile = await parseProfile(profileRepo, fromProfileObj, plugin);
    }
    const parsed: ParsedProfile = Object.assign({}, fromProfile ? fromProfile : {}, profile) as ParsedProfile;
    if (fromProfile && fromProfile.operationConfig) {
        if (prof.operationConfig) {
            parsed.operationConfig = JSON.stringify(
                mergeDeep(JSON.parse(fromProfile.operationConfig), JSON.parse(prof.operationConfig)),
            );
        } else {
            parsed.operationConfig = JSON.stringify(JSON.parse(fromProfile.operationConfig));
        }
    }

    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = await profileRepo.findById(subProf);
            parsed.subProfileObjects.push(await parseProfile(profileRepo, subProfObject, plugin));
        }
    }

    if (prof.additionalAssets && prof.additionalAssets.length > 0) {
        parsed.additionalAssetsRegexes = prof.additionalAssets.map((re: string) => new RegExp(re));
    }

    if (!parsed.noop) {
        const operations = plugin.operations();
        parsed.operationObject = operations[parsed.operation];
        if (!parsed.operationObject) {
            throw new Error(`parseProfile(${prof.name}): operation=${prof.operation} not found in plugin.operations`);
        }
    }
    if (prof.operationConfig) {
        parsed.operationConfigObject = JSON.parse(prof.operationConfig);
    }
    return parsed;
};

export const loadProfile = (name: string): ParsedProfile => MEDIA_PROFILES[name];

export const applyProfile = async (
    downloaded: string,
    media: string,
    profileName: string,
    outDir: string,
    sourcePath: string,
    conn: MobilettoConnection,
    analysisResults: ProfileJobType[],
): Promise<ApplyProfileResponse> => {
    const profile = MEDIA_PROFILES[profileName];
    if (profile.noop) throw new Error(`applyProfile: cannot apply noop profile: ${profile.name}`);
    if (!profile.enabled) throw new Error(`applyProfile: profile not enabled: ${profile.name}`);
    if (!profile.operation) throw new Error(`applyProfile: no operation defined for profile: ${profile.name}`);

    const plugin = MEDIA_PLUGINS[media];
    const opFunction = plugin.operationFunction(profile.operation);
    if (!opFunction) {
        throw new Error(`applyProfile: undefined operation=${profile.operation} for profile=${profile.name}`);
    }
    return opFunction(downloaded, profile, outDir, sourcePath, conn, analysisResults);
};
