import { MobilettoConnection } from "mobiletto-base";
import { basename, MobilettoOrmRepository, shaLevels } from "mobiletto-orm";
import { MediaProfileType, MediaType } from "yuebing-model";
import { ApplyProfileResponse, MediaPlugin, ParsedProfile } from "./type.js";

const MEDIA_PLUGINS: Record<string, MediaPlugin> = {};

const MEDIA_PROFILES: Record<string, ParsedProfile> = {};

export type ParsedProperties = Record<string, object | string | number>;

export const registerMediaDriver = async (
    media: MediaType,
    plugin: MediaPlugin,
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
) => {
    // load profiles
    const profiles = (await profileRepo.safeFindBy("media", media.name)) as MediaProfileType[];
    if (profiles.length === 0) {
        throw new Error(`registerMediaDriver(${media.name}): no profiles defined`);
    }
    for (const profile of profiles) {
        const parsed = await parseProfile(profileRepo, profile, plugin);
        if (parsed) {
            MEDIA_PROFILES[parsed.name] = parsed;
        }
    }
    MEDIA_PLUGINS[media.name] = plugin;
};

const parseProfile = async (
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    profile: MediaProfileType | string,
    plugin: MediaPlugin,
): Promise<ParsedProfile> => {
    const prof: MediaProfileType = typeof profile === "string" ? await profileRepo.findById(profile) : profile;

    let fromProfile: ParsedProfile | null = null;
    if (prof.from) {
        const fromProfileObj = await profileRepo.findById(prof.from);
        fromProfile = await parseProfile(profileRepo, fromProfileObj, plugin);
    }
    const parsed: ParsedProfile = Object.assign({}, fromProfile ? fromProfile : {}, profile) as ParsedProfile;

    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = await profileRepo.findById(subProf);
            parsed.subProfileObjects.push(await parseProfile(profileRepo, subProfObject, plugin));
        }
    }

    if (prof.additionalAssets && prof.additionalAssets.length > 0) {
        prof.additionalAssetsRegexes = prof.additionalAssets.map((re: string) => new RegExp(re));
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
): Promise<ApplyProfileResponse> => {
    const profile = MEDIA_PROFILES[profileName];
    const plugin = MEDIA_PLUGINS[media];
    return plugin.applyProfile(downloaded, profile, outDir, sourcePath, conn);
};

const ASSET_PATH_PREFIX = "ybAssets";
const ASSET_SHA_LEVELS = 3;

export const destinationProfilePath = (sourceAsset: string, media: string, profile: string): string =>
    `${ASSET_PATH_PREFIX}/${shaLevels(sourceAsset, ASSET_SHA_LEVELS)}/${basename(sourceAsset)}/${media}/${profile}`;

export const destinationPath = (sourceAsset: string, media: string, profile: string, filename: string): string =>
    `${destinationProfilePath(sourceAsset, media, profile)}/${basename(filename)}`;
