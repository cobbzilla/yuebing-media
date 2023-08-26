var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const MEDIA_PLUGINS = {};
const MEDIA_PROFILES = {};
export const registerMediaPlugin = (plugin, mediaRepo, profileRepo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!plugin.media) {
        throw new Error(`registerMediaPlugin: plugin.media was undefined. plugin=${JSON.stringify(plugin)}`);
    }
    // load media
    const existingMedia = yield mediaRepo.safeFindById(plugin.media.name);
    if (existingMedia) {
        console.warn(`registerMediaPlugin: plugin for media=${plugin.media.name} already registered`);
        return false;
    }
    const media = yield mediaRepo.create(plugin.media);
    // load profiles
    let profiles = (yield profileRepo.safeFindBy("media", media.name));
    if (!profiles || profiles.length === 0) {
        profiles = [];
        for (const profile of plugin.defaultProfiles()) {
            profile.media = plugin.media.name;
            profiles.push(yield profileRepo.create(profile));
        }
    }
    for (const profile of profiles) {
        const parsed = yield parseProfile(profileRepo, profile, plugin);
        if (parsed) {
            MEDIA_PROFILES[parsed.name] = parsed;
        }
    }
    MEDIA_PLUGINS[media.name] = plugin;
    return true;
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
    let fromProfile = null;
    if (prof.from) {
        const fromProfileObj = yield profileRepo.findById(prof.from);
        fromProfile = yield parseProfile(profileRepo, fromProfileObj, plugin);
    }
    const parsed = Object.assign({}, fromProfile ? fromProfile : {}, profile);
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
    const operations = plugin.operations();
    parsed.operationObject = operations[prof.operation];
    if (!parsed.operationObject) {
        throw new Error(`parseProfile(${prof.name}): operation=${prof.operation} not found in plugin.operations`);
    }
    if (prof.operationConfig) {
        parsed.operationConfigObject = JSON.parse(prof.operationConfig);
    }
    return parsed;
});
export const loadProfile = (name) => MEDIA_PROFILES[name];
export const applyProfile = (downloaded, media, profileName, outDir, sourcePath, conn, analysisResults) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = MEDIA_PROFILES[profileName];
    const plugin = MEDIA_PLUGINS[media];
    return plugin.applyProfile(downloaded, profile, outDir, sourcePath, conn, analysisResults);
});
