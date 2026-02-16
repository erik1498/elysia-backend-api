import { AnyMySqlColumn, MySqlTableWithColumns, TableConfig } from "drizzle-orm/mysql-core";
import { TSchema } from "elysia";
import { BaseColumns } from "../models/base.model";

type BaseKeys = keyof typeof BaseColumns;

export interface TableWithBase extends TableConfig {
    columns: Record<BaseKeys, AnyMySqlColumn> & TableConfig["columns"];
}

export interface RouteConfig<T extends TableWithBase> {
    /** Nama unik konfigurasi (Internal) */
    name: string;
    /** Nama entitas yang akan muncul di Swagger Tags dan Log */
    entityName: string;
    /** * Base path untuk API. 
     * @example "/v1/inventory/barang"
     */
    prefix: string;
    /** Instance tabel dari Drizzle ORM */
    model: MySqlTableWithColumns<T>;
    filterKeys: string[];
    /** * Array kolom yang diizinkan untuk fitur pencarian global.
     * Hanya menerima kolom yang terdefinisi di dalam tabel {@link T}.
     */
    sortKeys: string[];
    searchKeys: string[];
    tags: string[];
    /** Definisi skema validasi (Elysia TSchema) untuk body dan response */
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