import { MediaOperationType, MediaProfileType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";
export type ParsedProfile = MediaProfileType & {
    subProfileObjects?: ParsedProfile[];
    operationObject?: MediaOperationType;
};
export declare const parseProfile: (mediaProfileRepo: MobilettoOrmRepository<MediaProfileType>, mediaOperationRepo: MobilettoOrmRepository<MediaOperationType>, profile: MediaProfileType) => Promise<ParsedProfile>;
