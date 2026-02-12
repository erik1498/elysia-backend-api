import { mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const roleTable = mysqlTable("role_tab", {
    uuid: varchar("uuid", { length: 36 }).primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull()
})