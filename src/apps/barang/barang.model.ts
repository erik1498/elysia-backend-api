import { sql } from "drizzle-orm";
import { mysqlTable, varchar, decimal, text, int, timestamp, boolean } from "drizzle-orm/mysql-core";

export const barangTable = mysqlTable("barang_tab", {
    id: int("id").autoincrement().primaryKey(),
    uuid: varchar("uuid", { length: 36 }).$default(() => crypto.randomUUID()),
    nama: varchar("nama", { length: 255 }).notNull(),
    harga: decimal("harga", { precision: 12, scale: 2 }).notNull(),
    detail: text("detail"),

    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
        .onUpdateNow(),
    createdBy: varchar("created_by", { length: 36 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 36 }).unique(),
    updatedBy: varchar("updated_by", { length: 36 }).default("Empty"),
    enabled: boolean("enabled").default(true)
});