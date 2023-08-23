import { basename, MobilettoOrmRepository, shaLevels } from "mobiletto-orm";
import { MediaOperationType, MediaProfileType, MediaPropertyType, MediaType } from "yuebing-model";
import { ApplyProfileResponse, MediaDriver, MediaPlugin, ParsedProfile } from "./type.js";

const MEDIA_DRIVERS: Record<string, MediaDriver> = {};

const MEDIA_PROFILES: Record<string, ParsedProfile> = {};

export type ParsedProperties = Record<string, object | string | number>;

export const registerMediaDriver = async (
    media: MediaType,
    plugin: MediaPlugin,
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    operationRepo: MobilettoOrmRepository<MediaOperationType>,
    propRepo: MobilettoOrmRepository<MediaPropertyType>,
) => {
    // load properties
    const props = (await propRepo.safeFindBy("media", media.name)) as MediaPropertyType[];
    const parsedProps: ParsedProperties = {};
    for (const prop of props) {
        parsedProps[prop.name] = prop.value ? JSON.parse(prop.value) : null;
    }

    // load operations
    const operations = (await operationRepo.safeFindBy("media", media.name)) as MediaOperationType[];
    if (operations.length === 0) {
        throw new Error(`registerMediaDriver(${media.name}): no operations defined`);
    }

    // load profiles
    const profiles = (await profileRepo.safeFindBy("media", media.name)) as MediaProfileType[];
    if (profiles.length === 0) {
        throw new Error(`registerMediaDriver(${media.name}): no profiles defined`);
    }
    for (const profile of profiles) {
        const parsed = await parseProfile(profileRepo, parsedProps, operations, profile, plugin);
        if (parsed) {
            MEDIA_PROFILES[parsed.name] = parsed;
        }
    }
    MEDIA_DRIVERS[media.name] = {
        operations,
        props: parsedProps,
        plugin,
    };
};

const parseProfile = async (
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    parsedProps: ParsedProperties,
    operations: MediaOperationType[],
    profile: MediaProfileType | string,
    plugin: MediaPlugin,
): Promise<ParsedProfile> => {
    const prof: MediaProfileType = typeof profile === "string" ? await profileRepo.findById(profile) : profile;

    let fromProfile: ParsedProfile | null = null;
    if (prof.from) {
        const fromProfileObj = await profileRepo.findById(prof.from);
        fromProfile = await parseProfile(profileRepo, parsedProps, operations, fromProfileObj, plugin);
    }
    const parsed: ParsedProfile = Object.assign({}, fromProfile ? fromProfile : {}, profile) as ParsedProfile;

    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = await profileRepo.findById(subProf);
            parsed.subProfileObjects.push(
                await parseProfile(profileRepo, parsedProps, operations, subProfObject, plugin),
            );
        }
    }

    if (prof.operation) {
        const op = operations.find((op) => op.name === prof.operation);
        if (op) {
            parsed.operationObject = op;
            parsed.operationConfigType = plugin.operationConfigType(op, parsedProps);
            parsed.operationConfig = prof.operationConfig ? JSON.parse(prof.operationConfig) : undefined;
        }
    }
    if (prof.additionalAssets && prof.additionalAssets.length > 0) {
        prof.additionalAssetsRegexes = prof.additionalAssets.map((re: string) => new RegExp(re));
    }
    return parsed;
};

export const loadProfile = (name: string): ParsedProfile => MEDIA_PROFILES[name];

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

const ASSET_PATH_PREFIX = "ybAssets";
const ASSET_SHA_LEVELS = 3;

export const destinationProfilePath = (sourceAsset: string, media: string, profile: string): string =>
    `${ASSET_PATH_PREFIX}/${shaLevels(sourceAsset, ASSET_SHA_LEVELS)}/${basename(sourceAsset)}/${media}/${profile}`;

export const destinationPath = (sourceAsset: string, media: string, profile: string, filename: string): string =>
    `${destinationProfilePath(sourceAsset, media, profile)}/${basename(filename)}`;
