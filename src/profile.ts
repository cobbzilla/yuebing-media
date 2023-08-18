import { MediaOperationType, MediaProfileType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";

export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    operationObject?: MediaOperationType;
};

const PARSED_PROFILES: Record<string, ParsedProfile> = {};

export const parseProfile = async (
    mediaProfileRepo: MobilettoOrmRepository<MediaProfileType>,
    mediaOperationRepo: MobilettoOrmRepository<MediaOperationType>,
    profile: MediaProfileType,
): Promise<ParsedProfile> => {
    if (!PARSED_PROFILES[profile.name]) {
        let fromProfile: MediaProfileType | null = null;
        if (profile.from) {
            const fromProfileObj = await mediaProfileRepo.findById(profile.from);
            fromProfile = await parseProfile(mediaProfileRepo, mediaOperationRepo, fromProfileObj);
        }
        const parsed: MediaProfileType = Object.assign({}, fromProfile ? fromProfile : {}, profile);

        if (profile.subProfiles && profile.subProfiles.length > 0) {
            parsed.subProfileObjects = [];
            for (const subProf of profile.subProfiles) {
                const subProfObject = await mediaProfileRepo.findById(subProf);
                parsed.subProfileObjects.push(await parseProfile(mediaProfileRepo, mediaOperationRepo, subProfObject));
            }
        }

        if (profile.operation) {
            parsed.operationObject = mediaOperationRepo.findById(profile.operation);
        }
        PARSED_PROFILES[profile.name] = parsed;
    }
    return PARSED_PROFILES[profile.name];
};
