import { MediaOperationType, MediaProfileType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";
export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    operationObject?: MediaOperationType;
};
export declare const parseProfile: (profileRepo: MobilettoOrmRepository<MediaProfileType>, opRepo: MobilettoOrmRepository<MediaOperationType>, profile: MediaProfileType | string, profileCache?: Record<string, ParsedProfile>) => Promise<ParsedProfile>;
