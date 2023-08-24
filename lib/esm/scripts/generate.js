import { fileURLToPath } from "url";
import path from "path";
import { generateTypeScriptType } from "mobiletto-orm-typedef-gen";
import { capitalize } from "yuebing-util";
import { MediaOperationTypeDef } from "../type.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TS_TYPE_DIR = `${__dirname}/../../../src/type`;
const genTsType = (typeDef, tsTypeDir) => generateTypeScriptType(typeDef, {
    outfile: `${tsTypeDir ? tsTypeDir : TS_TYPE_DIR}/${capitalize(typeDef.typeName)}Type.ts`,
});
const OP_TYPES = [MediaOperationTypeDef];
OP_TYPES.forEach((t) => genTsType(t));
