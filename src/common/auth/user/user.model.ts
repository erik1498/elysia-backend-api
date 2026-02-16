import { mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const userTable = mysqlTable("user_tab", {
    uuid: varchar("uuid", { length: 36 }).primaryKey(),
    nama: varchar("nama", { length: 255 }).notNull(),
    username: varchar("username", { length: 50 }).notNull(),
    password: varchar("password", { length: 255 }).notNull()
})