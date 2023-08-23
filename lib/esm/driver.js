var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { basename, shaLevels } from "mobiletto-orm";
const MEDIA_DRIVERS = {};
const MEDIA_PROFILES = {};
export const registerMediaDriver = (media, plugin, profileRepo, operationRepo, propRepo) => __awaiter(void 0, void 0, void 0, function* () {
    // load properties
    const props = (yield propRepo.safeFindBy("media", media.name));
    const parsedProps = {};
    for (const prop of props) {
        parsedProps[prop.name] = prop.value ? JSON.parse(prop.value) : null;
    }
    // load operations
    const operations = (yield operationRepo.safeFindBy("media", media.name));
    if (operations.length === 0) {
        throw new Error(`registerMediaDriver(${media.name}): no operations defined`);
    }
    // load profiles
    const profiles = (yield profileRepo.safeFindBy("media", media.name));
    if (profiles.length === 0) {
        throw new Error(`registerMediaDriver(${media.name}): no profiles defined`);
    }
    for (const profile of profiles) {
        const parsed = yield parseProfile(profileRepo, parsedProps, operations, profile, plugin);
        if (parsed) {
            MEDIA_PROFILES[parsed.name] = parsed;
        }
    }
    MEDIA_DRIVERS[media.name] = {
        operations,
        props: parsedProps,
        plugin,
    };
});
const parseProfile = (profileRepo, parsedProps, operations, profile, plugin) => __awaiter(void 0, void 0, void 0, function* () {
    const prof = typeof profile === "string" ? yield profileRepo.findById(profile) : profile;
    let fromProfile = null;
    if (prof.from) {
        const fromProfileObj = yield profileRepo.findById(prof.from);
        fromProfile = yield parseProfile(profileRepo, parsedProps, operations, fromProfileObj, plugin);
    }
    const parsed = Object.assign({}, fromProfile ? fromProfile : {}, profile);
    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = yield profileRepo.findById(subProf);
            parsed.subProfileObjects.push(yield parseProfile(profileRepo, parsedProps, operations, subProfObject, plugin));
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
        prof.additionalAssetsRegexes = prof.additionalAssets.map((re) => new RegExp(re));
    }
    return parsed;
});
export const loadProfile = (name) => MEDIA_PROFILES[name];
export const applyProfile = (downloaded, media, profileName, outDir) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = MEDIA_PROFILES[profileName];
    const driver = MEDIA_DRIVERS[media];
    return driver.plugin.applyProfile(downloaded, profile, driver.props, outDir);
});
const ASSET_PATH_PREFIX = "ybAssets";
const ASSET_SHA_LEVELS = 3;
export const destinationProfilePath = (sourceAsset, media, profile) => `${ASSET_PATH_PREFIX}/${shaLevels(sourceAsset, ASSET_SHA_LEVELS)}/${basename(sourceAsset)}/${media}/${profile}`;
export const destinationPath = (sourceAsset, media, profile, filename) => `${destinationProfilePath(sourceAsset, media, profile)}/${basename(filename)}`;
