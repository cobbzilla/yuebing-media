export type SpawnResult = {
    stdout: string;
    stderr: string;
    exitCode: number | null;
};
export declare const runExternalCommand: (command: string, args: string[]) => Promise<SpawnResult>;
