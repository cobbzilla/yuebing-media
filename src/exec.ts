import { spawn } from "child_process";

export type SpawnResult = {
    stdout: string;
    stderr: string;
    exitCode: number | null;
};

export const runExternalCommand = async (command: string, args: string[]): Promise<SpawnResult> => {
    return new Promise((resolve, reject) => {
        if (typeof args === "string") args = [args];
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
            resolve({
                stdout: stdout.toString(),
                stderr: stderr.toString(),
                exitCode: code,
            });
        });

        process.on("error", (err) => {
            reject(err);
        });
    });
};
