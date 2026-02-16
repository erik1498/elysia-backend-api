import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { BaseColumns } from "../../common/schemas/base-model.schema";

export const sumberDanaTable = mysqlTable("sumber_dana_tab", {
    nama: varchar("nama", { length: 255 }).notNull(),
    ...BaseColumns
});