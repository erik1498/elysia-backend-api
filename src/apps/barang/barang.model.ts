import { mysqlTable, varchar, decimal, text, int } from "drizzle-orm/mysql-core";

export const barangTable = mysqlTable("barang_tab", {
    id: int("id").autoincrement().primaryKey(),
    uuid: varchar("uuid", { length: 36 }).$default(() => crypto.randomUUID()),
    nama: varchar("nama", { length: 255 }).notNull(),
    harga: decimal("harga", { precision: 12, scale: 2 }).notNull(),
    detail: text("detail")
});