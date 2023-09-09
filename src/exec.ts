import { spawn } from "child_process";
import { MobilettoLogger } from "mobiletto-base";

export type SpawnResult = {
    stdout: string;
    stderr: string;
    exitCode: number | null;
};

export const quoteArgs = (args: string[]) => {
    return args.map((a) => (a.includes(" ") ? `"${a.replace('"', '\\""')}"` : a)).join(" ");
};

export const runExternalCommand = async (
    logger: MobilettoLogger,
    command: string,
    args: string[],
): Promise<SpawnResult> => {
    return new Promise((resolve, reject) => {
        if (typeof args === "string") args = [args];

        const spawnLine = `spawn=${command} ${quoteArgs(args)}`;
        const infoEnabled = logger && logger.isInfoEnabled();
        if (infoEnabled) logger.info(`runExternalCommand START ${spawnLine}`);

        const process = spawn(command, args);

        let stdout = "";
        let stderr = "";

        process.stdout.on("data", (data) => {
            stdout += data;
        });

        process.stderr.on("data", (data) => {
            stderr += data;
        });

        process.on("close", (code) => {
            if (infoEnabled) logger.info(`runExternalCommand EXIT=${code} ${spawnLine}`);
            resolve({
                stdout: stdout.toString(),
                stderr: stderr.toString(),
                exitCode: code,
            });
        });

        process.on("error", (err) => {
            if (infoEnabled) logger.info(`runExternalCommand ERROR=${err} ${spawnLine}`);
            reject(err);
        });
    });
};
