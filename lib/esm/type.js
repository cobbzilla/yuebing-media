import { MobilettoOrmTypeDef } from "mobiletto-orm-typedef";
export const MediaOperationTypeDef = new MobilettoOrmTypeDef({
    typeName: "MediaOperation",
    fields: {
        name: { required: true, type: "string" },
        analysis: { default: false },
        command: { type: "string" },
        func: { default: false },
        minFileSize: { required: true, default: 0 },
    },
    validations: {
        must_define_command_or_func: {
            field: "command",
            valid: (v) => (typeof v.command === "string" && v.command.length > 0) || (typeof v.func === "boolean" && v.func),
        },
    },
});
