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
export const runExternalCommand = (command, args) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        if (typeof args === "string")
            args = [args];
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
});
