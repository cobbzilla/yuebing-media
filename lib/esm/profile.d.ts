import { MediaProfileType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";
export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
};
export declare const parseProfile: (mediaProfileRepo: MobilettoOrmRepository<MediaProfileType>, profile: MediaProfileType) => Promise<ParsedProfile>;
