import { MediaOperationType, MediaProfileType } from "yuebing-model";
import { MobilettoOrmRepository } from "mobiletto-orm";
import { MediaPlugin, ParsedProfile } from "./type.js";
export declare const parseProfile: (profileRepo: MobilettoOrmRepository<MediaProfileType>, operations: MediaOperationType[], profile: MediaProfileType | string, plugin: MediaPlugin) => Promise<ParsedProfile>;
