var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { parseProfile } from "./profile.js";
const MEDIA_DRIVERS = {};
export const registerMediaDriver = (media, plugin, profileRepo, operationRepo, propRepo) => __awaiter(void 0, void 0, void 0, function* () {
    const profiles = yield profileRepo.safeFindBy("media", media.name);
    const parsedProfiles = [];
    for (const profile of profiles) {
        parsedProfiles.push(yield parseProfile(profileRepo, operationRepo, profile));
    }
    const props = yield propRepo.safeFindBy("media", media.name);
    const parsedProps = {};
    for (const prop of props) {
        parsedProps[prop.name] = prop.value ? JSON.parse(prop.value) : null;
    }
    MEDIA_DRIVERS[media.name] = {
        profiles: parsedProfiles,
        props: parsedProps,
        plugin,
    };
});
export const applyProfile = (downloaded, profile, outDir) => __awaiter(void 0, void 0, void 0, function* () {
    const driver = MEDIA_DRIVERS[profile.media];
    return driver.plugin.applyProfile(downloaded, profile, driver.props, outDir);
});
