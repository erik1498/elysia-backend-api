import { eq, InferInsertModel } from "drizzle-orm";
import { db } from "../../../common/config/database/database.config";
import { userTable } from "./user.model";

export const userRepository = {
    getUserLoginDataByUsernameRepository: async (username: string) => {
        const [user] = await db
            .select({
                uuid: userTable.uuid,
                password: userTable.password
            })
            .from(userTable)
            .where(eq(userTable.username, username))

        return user
    },
    registerUserRepository: async (data: InferInsertModel<typeof userTable>) => {
        return await db
            .insert(userTable)
            .values(data)
    },
    getUserInfoRepository: async (userUuid: string) => {
        const [user] = await db
            .select({
                nama: userTable.nama,
                username: userTable.username
            })
            .from(userTable)
            .where(eq(userTable.uuid, userUuid))

        return user
    }
}