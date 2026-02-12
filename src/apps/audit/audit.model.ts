import { sql } from "drizzle-orm";
import { int, json, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const auditLogTable = mysqlTable("audit_log_tab", {
    id: int("id").autoincrement().primaryKey(),
    uuid: varchar("uuid", { length: 36 }).$default(() => crypto.randomUUID()),
    userUuid: varchar("user_uuid", { length: 36 }),
    action: varchar("action", { length: 50 }).notNull(),
    entity: varchar("entity", { length: 50 }).notNull(),
    entityUuid: varchar("entity_uuid", { length: 36 }),
    oldData: json("old_data"),
    newData: json("new_data"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 512 }),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
});