import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { userTable } from "../user/user.model";
import { sql } from "drizzle-orm";

export const tokenTable = mysqlTable("token_tab", {
    userUuid: varchar("user_uuid", { length: 36 }).references(() => userTable.uuid).notNull().unique(),
    refreshToken: text("refresh_token").notNull(),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    expiresAt: timestamp("expires_at").notNull()
})