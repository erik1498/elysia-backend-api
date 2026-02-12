import { eq } from "drizzle-orm";
import { roleTable } from "../role/role.model";
import { userRoleTable } from "./user-role.model";
import { db } from "../../../common/config/database/database.config";

export const userRoleRepository = {
    getRoleListByUserUUIDRepository: async (userUuid: string) => {
        return await db
            .select({
                nama: roleTable.nama
            })
            .from(userRoleTable)
            .leftJoin(roleTable, eq(roleTable.uuid, userRoleTable.roleUuid))
            .where(eq(userRoleTable.userUuid, userUuid))
    }
}