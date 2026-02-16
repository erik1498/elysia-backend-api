import { AnyMySqlColumn, MySqlTableWithColumns, TableConfig } from "drizzle-orm/mysql-core";
import { TSchema } from "elysia";
import { BaseColumns } from "../models/base.model";

type BaseKeys = keyof typeof BaseColumns;

export interface TableWithBase extends TableConfig {
    columns: Record<BaseKeys, AnyMySqlColumn> & TableConfig["columns"];
}

/**
 * Creates a new record in the table and records the activity to the audit log.
 * * @template T - Table configuration type that must implement {@link BaseColumns}.
 * @param data - The data object to be inserted, matching the table schema.
 * @param meta - Request metadata for audit trail (User UUID, IP Address, Request ID, etc.).
 * @param model - Drizzle ORM MySQL table instance.
 * * **IMPORTANT**: The model must be defined by spreading `...BaseColumns`.
 * @example
 * ```typescript
    import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
    import { BaseColumns } from "../../common/schemas/base-model.schema";
    export const itemTable = mysqlTable("item_tab", {
    column1: varchar("column_1", { length: 255 }).notNull(),
        ...BaseColumns
    });
 * ```
 * * @param entityName - The name of the entity (e.g., "Item") for log entries.
 * @returns Returns the database execution result of the insert operation.
 * @throws Throws an error if a duplicate entry is found or connection fails.
 * * @example
 * ```typescript
 * await createRepository(body, meta, itemTable, "Item");
 * ```
 */

export interface RouteConfig<T extends TableWithBase> {
    name: string;
    entityName: string;
    prefix: string;
    model: MySqlTableWithColumns<T>;
    filterKeys: string[];
    sortKeys: string[];
    searchKeys: string[];
    tags: string[];
    schemas: {
        body: TSchema;
        response: TSchema;
    };
    roles: {
        getAllDataRoles: string[],
        getDataRoles: string[],
        updateDataRoles: string[],
        deleteDataRoles: string[],
    }
}