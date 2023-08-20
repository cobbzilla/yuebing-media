var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const parseProfile = (profileRepo, operations, profile, plugin) => __awaiter(void 0, void 0, void 0, function* () {
    const prof = typeof profile === "string" ? yield profileRepo.findById(profile) : profile;
    let fromProfile = null;
    if (prof.from) {
        const fromProfileObj = yield profileRepo.findById(prof.from);
        fromProfile = yield parseProfile(profileRepo, operations, fromProfileObj, plugin);
    }
    const parsed = Object.assign({}, fromProfile ? fromProfile : {}, profile);
    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = yield profileRepo.findById(subProf);
            parsed.subProfileObjects.push(yield parseProfile(profileRepo, operations, subProfObject, plugin));
        }
    }
    if (prof.operation) {
        const op = operations.find((op) => op.name === prof.operation);
        if (op && op.configType) {
            parsed.operationObject = op;
            parsed.operationConfigType = plugin.operationConfigType(op);
            parsed.operationConfig = prof.operationConfig ? JSON.parse(prof.operationConfig) : undefined;
        }
    }
    return parsed;
});
