import { MySqlTableWithColumns } from "drizzle-orm/mysql-core";

export interface RouteConfig {
    name: string;
    entityName: string;
    prefix: string;
    model: MySqlTableWithColumns<any>;
    filterKeys: string[];
    sortKeys: string[];
    tags: string[];
    schemas: {
        body: any;
        response: any;
    };
    roles: {
        getAllDataRoles: string[],
        getDataRoles: string[],
        updateDataRoles: string[],
        deleteDataRoles: string[],
    }
}