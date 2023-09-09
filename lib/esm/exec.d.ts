import { MobilettoLogger } from "mobiletto-base";
export type SpawnResult = {
    stdout: string;
    stderr: string;
    exitCode: number | null;
};
export declare const quoteArgs: (args: string[]) => string;
export declare const runExternalCommand: (logger: MobilettoLogger, command: string, args: string[]) => Promise<SpawnResult>;
