import { eq, InferInsertModel } from "drizzle-orm";
import { tokenTable } from "./token.model";
import { db } from "../../config/database/database.config";

export const tokenRepository = {
    createUserTokenRepository: async (data: InferInsertModel<typeof tokenTable>) => {
        return await db
            .insert(tokenTable)
            .values(data)
            .onDuplicateKeyUpdate({
                set: data
            })
    },
    getUserTokenByRefreshTokenRepository: async (refreshToken: string) => {
        const [token] = await db
            .select()
            .from(tokenTable)
            .where(eq(tokenTable.refreshToken, refreshToken))
        return token
    },
    deleteUserTokenByUserUuidRepository: async (userUuid: string) => {
        await db.delete(tokenTable).where(eq(tokenTable.userUuid, userUuid))
    }
}