import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { BaseColumns } from "../../common/models/base.model";

export const sumberDanaTable = mysqlTable("sumber_dana_tab", {
    nama: varchar("nama", { length: 255 }).notNull(),
    ...BaseColumns
});