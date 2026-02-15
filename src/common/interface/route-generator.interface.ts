import { MySqlTableWithColumns, TableConfig } from "drizzle-orm/mysql-core";
import { TSchema } from "elysia";

export interface RouteConfig<T extends TableConfig> {
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