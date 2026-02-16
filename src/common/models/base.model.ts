import { sql } from "drizzle-orm";
import { varchar, timestamp, boolean, int } from "drizzle-orm/mysql-core";

/**
 * Standardized set of base columns used for every table in the database.
 * These columns provide a consistent foundation for identification, 
 * audit tracking, and system-level features like idempotency.
 * * * @example
 * ```typescript
 * export const usersTable = mysqlTable("users", {
 * email: varchar("email", { length: 255 }).unique(),
 * ...BaseColumns
 * });
 * ```
 */
export const BaseColumns = {
    /** * Internal numeric identifier.
     * Primary key with auto-increment enabled.
     */
    id: int("id").autoincrement().primaryKey(),

    /** * Public unique identifier.
     * Generated automatically as a UUID v4.
     */
    uuid: varchar("uuid", { length: 36 }).$default(() => crypto.randomUUID()),
    
    /** * Record creation timestamp.
     * Automatically set to the current time when a record is inserted.
     */
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    /** * Record update timestamp.
     * Automatically updates to the current time whenever a row is modified.
     */
    updatedAt: timestamp("updated_at")
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`)
        .onUpdateNow(),

    /** * Audit Trail: Stores the UUID of the user who created the record.
     */
    createdBy: varchar("created_by", { length: 36 }).notNull(),

    /** * Audit Trail: Stores the UUID of the user who last updated the record.
     * Defaults to "Empty" until an update occurs.
     */
    updatedBy: varchar("updated_by", { length: 36 }).default("Empty"),
    
    /** * System Feature: Used to ensure requests are processed only once.
     * Prevents duplicate transactions for the same business operation.
     */
    idempotencyKey: varchar("idempotency_key", { length: 36 }).unique(),

    /** * System Feature: Soft-delete/Toggle mechanism.
     * If false, the record should be excluded from standard queries.
     */
    enabled: boolean("enabled").default(true)
};

/**
 * TypeScript type inferred from the {@link BaseColumns} schema.
 * Useful for validating object structures in services and repositories.
 */
export type BaseColumnsType = {
    [K in keyof typeof BaseColumns]: typeof BaseColumns[K]["_"]["data"];
};