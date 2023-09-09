var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn } from "child_process";
export const quoteArgs = (args) => {
    return args.map((a) => (a.includes(" ") ? `"${a.replace('"', '\\""')}"` : a)).join(" ");
};
export const runExternalCommand = (logger, command, args) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        if (typeof args === "string")
            args = [args];
        const spawnLine = `spawn=${command} ${quoteArgs(args)}`;
        const infoEnabled = logger && logger.isInfoEnabled();
        if (infoEnabled)
            logger.info(`runExternalCommand START ${spawnLine}`);
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
            if (infoEnabled)
                logger.info(`runExternalCommand EXIT=${code} ${spawnLine}`);
            resolve({
                stdout: stdout.toString(),
                stderr: stderr.toString(),
                exitCode: code,
            });
        });
        process.on("error", (err) => {
            if (infoEnabled)
                logger.info(`runExternalCommand ERROR=${err} ${spawnLine}`);
            reject(err);
        });
    });
});
