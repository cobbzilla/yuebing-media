import { MobilettoOrmObject } from "mobiletto-orm-typedef";
export type MediaOperationType = MobilettoOrmObject & {
    name: string;
    analysis?: boolean;
    command?: string;
    func?: boolean;
    minFileSize: number;
};
