var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PARSED_PROFILES = {};
export const parseProfile = (mediaProfileRepo, mediaOperationRepo, profile) => __awaiter(void 0, void 0, void 0, function* () {
    if (!PARSED_PROFILES[profile.name]) {
        let fromProfile = null;
        if (profile.from) {
            const fromProfileObj = yield mediaProfileRepo.findById(profile.from);
            fromProfile = yield parseProfile(mediaProfileRepo, mediaOperationRepo, fromProfileObj);
        }
        const parsed = Object.assign({}, fromProfile ? fromProfile : {}, profile);
        if (profile.subProfiles && profile.subProfiles.length > 0) {
            parsed.subProfileObjects = [];
            for (const subProf of profile.subProfiles) {
                const subProfObject = yield mediaProfileRepo.findById(subProf);
                parsed.subProfileObjects.push(yield parseProfile(mediaProfileRepo, mediaOperationRepo, subProfObject));
            }
        }
        if (profile.operation) {
            parsed.operationObject = mediaOperationRepo.findById(profile.operation);
        }
        PARSED_PROFILES[profile.name] = parsed;
    }
    return PARSED_PROFILES[profile.name];
});
