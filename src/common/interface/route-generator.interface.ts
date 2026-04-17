import { AnyMySqlColumn, MySqlTableWithColumns, MySqlTransaction, TableConfig } from "drizzle-orm/mysql-core";
import { OptionalHandler, TSchema } from "elysia";
import { BaseColumns } from "../models/base.model";
import { MySql2PreparedQueryHKT, MySql2QueryResultHKT } from "drizzle-orm/mysql2";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { RequestMeta } from "./context";

/**
 * Represents the required key set for any table utilizing the BaseColumns.
 * Ensures that the 'id', 'uuid', 'createdAt', etc, are present.
 */
type BaseKeys = keyof typeof BaseColumns;

/**
 * An extension of the Drizzle TableConfig.
 * This interface mandates that any table passed to the generic generator 
 * MUST include the standard BaseColumns (Audit trail, identity, and soft-delete fields).
 * * @interface TableWithBase
 */
export interface TableWithBase extends TableConfig {
    columns: Record<BaseKeys, AnyMySqlColumn> & TableConfig["columns"];
}

export type DatabaseTransaction = MySqlTransaction<
    MySql2QueryResultHKT, 
    MySql2PreparedQueryHKT, 
    Record<string, never>, 
    ExtractTablesWithRelations<Record<string, never>>
>;

export interface CreatedDataTransactionFunction {
    beforeDataCreated?: (
        tx: DatabaseTransaction,
        data: any,
        meta: RequestMeta
    ) => Promise<any> | any;
    afterDataCreated?: (
        tx: DatabaseTransaction,
        data: any,
        meta: RequestMeta
    ) => Promise<any> | any;
}

export interface UpdatedDataTransactionFunction {
    beforeDataUpdated?: (
        tx: DatabaseTransaction,
        data: any,
        oldData: any,
        meta: RequestMeta
    ) => Promise<any> | any;
    afterDataUpdated?: (
        tx: DatabaseTransaction,
        data: any,
        oldData: any,
        meta: RequestMeta
    ) => Promise<any> | any;
}

export interface DeletedDataTransactionFunction {
    beforeDataDeleted?: (
        tx: DatabaseTransaction,
        data: any,
        oldData: any,
        meta: RequestMeta
    ) => Promise<any> | any;
    afterDataDeleted?: (
        tx: DatabaseTransaction,
        data: any,
        oldData: any,
        meta: RequestMeta
    ) => Promise<any> | any;
}

/**
 * The configuration object required to generate a complete set of RESTful routes.
 * This acts as the "Blueprints" for the Generic Route Generator.
 * * @template T - A Drizzle table that satisfies the {@link TableWithBase} requirements.
 */
export interface RouteConfig<T extends TableWithBase> {
    /** The display name of the entity (e.g, 'User', 'Product'). Used for logging. */
    name: string;
    /** The system identifier for the entity (e.g, 'USER_MGMT'). Used for Audit Logs. */
    entityName: string;
    /**
     * 
     * The Drizzle ORM model instance representing the database table.
     * 
     * **IMPORTANT**: The model must be defined with `createGenericModel` function.
     * @example
     * ```typescript
        import { varchar } from "drizzle-orm/mysql-core";
        import { createGenericModel } from "../../common/utils/route-generator.util";
        
        export const itemTable = createGenericModel("item_tab", {
            column1: varchar("column_1", { length: 255 }).notNull(),
        });
    * ```
     */
    model: MySqlTableWithColumns<T>;
    /** A whitelist of column names permitted for dynamic filtering. */
    filterKeys: string[];
    /** A whitelist of column names permitted for dynamic sorting. */
    sortKeys: string[];
    /** A whitelist of column names use datetime. */
    dateKeys?: string[];
    /** A whitelist of column names permitted for global search functionality. */
    searchKeys: string[];
    /** Swagger/OpenAPI tags for API documentation grouping. */
    tags: string[];
    /** * TypeBox/Elysia schemas for request validation.
     * Includes the request body and the expected success response structure.
     */
    schemas: {
        /**
         * @example
         * ```typescript
            import { t } from "elysia";
            
            export const ItemBodySchema = t.Object({
                column: t.String({
                    maxLength: 255,
                    minLength: 1,
                    examples: ["Item"]
                }),
            })
        * ```
        */
        body: TSchema;
        /**
         * @example
         * ```typescript
            import { t } from "elysia";

            export const ItemResponseSchema = t.Object({
                uuid: t.String({ format: 'uuid' }),
                nama: t.String(),
            });
        * ```
        */
        response: TSchema;
    };
    /** * Role-Based Access Control (RBAC) settings.
     * Defines which user roles are permitted to perform specific CRUD actions.
     */
    roles: {
        getAllDataRoles: string[],
        getDataRoles: string[],
        updateDataRoles: string[],
        deleteDataRoles: string[],
    }
    relationConfigs?: RelationConfig[],
    functionInTransaction?: {
        createData?: CreatedDataTransactionFunction,
        updateData?: UpdatedDataTransactionFunction,
        deleteData?: DeletedDataTransactionFunction
    },
    beforeHandle?: {
        createData?: OptionalHandler<any, any>,
        updateData?: OptionalHandler<any, any>,
        deleteData?: OptionalHandler<any, any>
    }
}

interface ColumnOnRelationTableName {
    columnOnRelationTableName: string;
    aliasName: string
}

export interface RelationConfig {
    relationTable: MySqlTableWithColumns<any>; 
    aliasedName?: string;
    columnOnTableName: string;
    relationData: ColumnOnRelationTableName[];
}