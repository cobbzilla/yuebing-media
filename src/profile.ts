import { MediaOperationType, MediaProfileType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";

export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    operationObject?: MediaOperationType;
};

export const parseProfile = async (
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    opRepo: MobilettoOrmRepository<MediaOperationType>,
    profile: MediaProfileType | string,
    profileCache?: Record<string, ParsedProfile>,
): Promise<ParsedProfile> => {
    const prof: MediaProfileType = typeof profile === "string" ? await profileRepo.findById(profile) : profile;
    if (profileCache && profileCache[profile.name]) return profileCache[prof.name];

    let fromProfile: MediaProfileType | null = null;
    if (prof.from) {
        const fromProfileObj = await profileRepo.findById(prof.from);
        fromProfile = await parseProfile(profileRepo, opRepo, fromProfileObj);
    }
    const parsed: MediaProfileType = Object.assign({}, fromProfile ? fromProfile : {}, profile);

    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = await profileRepo.findById(subProf);
            parsed.subProfileObjects.push(await parseProfile(profileRepo, opRepo, subProfObject));
        }
    }

    if (prof.operation) {
        parsed.operationObject = opRepo.findById(prof.operation);
    }
    if (profileCache) profileCache[prof.name] = parsed;
    return parsed;
};
