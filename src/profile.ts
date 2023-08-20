import { MediaOperationType, MediaProfileType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";
import { MediaPlugin, ParsedProfile } from "./type.js";

export const parseProfile = async (
    profileRepo: MobilettoOrmRepository<MediaProfileType>,
    operations: MediaOperationType[],
    profile: MediaProfileType | string,
    plugin: MediaPlugin,
): Promise<ParsedProfile> => {
    const prof: MediaProfileType = typeof profile === "string" ? await profileRepo.findById(profile) : profile;

    let fromProfile: ParsedProfile | null = null;
    if (prof.from) {
        const fromProfileObj = await profileRepo.findById(prof.from);
        fromProfile = await parseProfile(profileRepo, operations, fromProfileObj, plugin);
    }
    const parsed: ParsedProfile = Object.assign({}, fromProfile ? fromProfile : {}, profile) as ParsedProfile;

    if (prof.subProfiles && prof.subProfiles.length > 0) {
        parsed.subProfileObjects = [];
        for (const subProf of prof.subProfiles) {
            const subProfObject = await profileRepo.findById(subProf);
            parsed.subProfileObjects.push(await parseProfile(profileRepo, operations, subProfObject, plugin));
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
};
