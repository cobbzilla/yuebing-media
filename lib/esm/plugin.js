var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mergeDeep } from "mobiletto-orm";
const MEDIA_PLUGINS = {};
const MEDIA_PROFILES = {};
export const registerMediaPlugin = (plugin, mediaRepo, profileRepo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!plugin.media) {
        throw new Error(`registerMediaPlugin: plugin.media was undefined. plugin=${JSON.stringify(plugin)}`);
    }
    if (plugin.initialize)
        plugin.initialize();
    // load media
    let media = yield mediaRepo.safeFindById(plugin.media.name);
    if (media) {
        console.warn(`registerMediaPlugin: plugin for media=${plugin.media.name} already registered`);
    }
    else {
        media = yield mediaRepo.create(plugin.media);
    }
    // load profiles
    const profiles = (yield profileRepo.safeFindBy("media", media.name));
    const parsedProfiles = [];
    if (!profiles || profiles.length === 0) {
        for (const profile of plugin.defaultProfiles()) {
            const parsed = yield parseProfile(profileRepo, profile, plugin);
            const created = yield profileRepo.create(parsed);
            MEDIA_PROFILES[created.name] = yield parseProfile(profileRepo, created, plugin);
            parsedProfiles.push(MEDIA_PROFILES[created.name]);
        }
    }
    else {
        for (const profile of profiles) {
            const parsed = yield parseProfile(profileRepo, profile, plugin);
            MEDIA_PROFILES[parsed.name] = parsed;
            parsedProfiles.push(parsed);
        }
    }
    MEDIA_PLUGINS[media.name] = plugin;
    return parsedProfiles;
});
export const updateMediaProfile = (plugin, profile, profileRepo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!plugin.media) {
        throw new Error(`updateMediaProfile: plugin.media was undefined. plugin=${JSON.stringify(plugin)}`);
    }
    profile.media = plugin.media.name;
    const existing = yield profileRepo.safeFindById(profile.name);
    if (existing) {
        const update = Object.assign({}, existing, profile);
        profile = yield profileRepo.update(update);
    }
    else {
        profile = yield profileRepo.create(profile);
    }
    MEDIA_PROFILES[profile.name] = yield parseProfile(profileRepo, profile, plugin);
});
const parseProfile = (profileRepo, profile, plugin) => __awaiter(void 0, void 0, void 0, function* () {
    const prof = typeof profile === "string" ? yield profileRepo.findById(profile) : profile;
    if (plugin.media)
        prof.media = plugin.media.name;
    let fromProfile = null;
    if (prof.from) {
        const fromProfileObj = yield profileRepo.findById(prof.from);
        fromProfile = yield parseProfile(profileRepo, fromProfileObj, plugin);
    }
    const parsed = Object.assign({}, fromProfile ? fromProfile : {}, profile);
    if (fromProfile && fromProfile.operationConfig) {
        if (prof.operationConfig) {
            parsed.operationConfig = JSON.stringify(mergeDeep(JSON.parse(fromProfile.operationConfig), JSON.parse(prof.operationConfig)));
        }
        else {
            parsed.operationConfig = JSON.stringify(JSON.parse(fromProfile.operationConfig));
        }
    }
    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = yield profileRepo.findById(subProf);
            parsed.subProfileObjects.push(yield parseProfile(profileRepo, subProfObject, plugin));
        }
    }
    if (prof.additionalAssets && prof.additionalAssets.length > 0) {
        prof.additionalAssetsRegexes = prof.additionalAssets.map((re) => new RegExp(re));
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
});
export const loadProfile = (name) => MEDIA_PROFILES[name];
export const applyProfile = (downloaded, media, profileName, outDir, sourcePath, conn, analysisResults) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = MEDIA_PROFILES[profileName];
    if (profile.noop)
        throw new Error(`applyProfile: cannot apply noop profile: ${profile.name}`);
    if (!profile.enabled)
        throw new Error(`applyProfile: profile not enabled: ${profile.name}`);
    if (!profile.operation)
        throw new Error(`applyProfile: no operation defined for profile: ${profile.name}`);
    const plugin = MEDIA_PLUGINS[media];
    const opFunction = plugin.operationFunction(profile.operation);
    return opFunction(downloaded, profile, outDir, sourcePath, conn, analysisResults);
});
