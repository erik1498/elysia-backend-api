import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { userTable } from "../user/user.model";
import { roleTable } from "../role/role.model";

export const userRoleTable = mysqlTable("user_role_tab", {
    uuid: varchar("uuid", { length: 36 }).primaryKey(),
    userUuid: varchar("user_uuid", { length: 36 }).references(() => userTable.uuid),
    roleUuid: varchar("role_uuid", { length: 36 }).references(() => roleTable.uuid)
})