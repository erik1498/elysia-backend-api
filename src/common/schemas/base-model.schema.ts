import { sql } from "drizzle-orm";
import { varchar, timestamp, boolean, int } from "drizzle-orm/mysql-core";

export const BaseColumns = {
    // Indentity
    id: int("id").autoincrement().primaryKey(),
    uuid: varchar("uuid", { length: 36 }).$default(() => crypto.randomUUID()),
    
    // Audit Trail & Metadata
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
        .onUpdateNow(),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    updatedBy: varchar("updated_by", { length: 36 }).default("Empty"),
    
    // System Features
    idempotencyKey: varchar("idempotency_key", { length: 36 }).unique(),
    enabled: boolean("enabled").default(true)
};

export type BaseColumnsType = {
    [K in keyof typeof BaseColumns]: typeof BaseColumns[K]["_"]["data"];
};