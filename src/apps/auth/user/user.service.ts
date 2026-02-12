import { BadRequestError, UnauthorizedError } from "../../../common/errors/app.error"
import { tokenRepository } from "../token/token.repository"
import { userRoleRepository } from "../user-role/user-role.repository"
import { userRepository } from "./user.repository"

export const userService = {
    loginService: async (data: any, accessTokenConfig: any, refreshTokenConfig: any, meta: any) => {
        meta.log.info(data, "SERVICE: userService.loginService called")

        const user = await userRepository.getUserLoginDataByUsernameRepository(data.username)

        if (!user) throw new UnauthorizedError("Invalid username or password")

        const isMatch = await Bun.password.verify(data.password, user.password, "bcrypt")

        if (!isMatch) throw new UnauthorizedError("Invalid username or password")

        const roles = await userRoleRepository.getRoleListByUserUUIDRepository(user.uuid)

        const accessTokenPayload = {
            sub: user.uuid,
            roles: roles.map(x => x.nama)
        }

        const refreshTokenPayload = {
            sub: user.uuid
        }

        const accessToken = await accessTokenConfig.sign(accessTokenPayload)
        const refreshToken = await refreshTokenConfig.sign(refreshTokenPayload)

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await tokenRepository.createUserTokenRepository({
            userUuid: user.uuid,
            expiresAt,
            refreshToken,
        })

        return {
            accessToken,
            refreshToken
        }
    },
    refreshUserService: async (refreshToken: string, accessTokenConfig: any, refreshTokenConfig: any, meta: any) => {
        meta.log.info("SERVICE: userService.refreshUserService called")
        if (!refreshToken) throw new BadRequestError

        const refreshTokenVerify = await refreshTokenConfig.verify(refreshToken)

        if (!refreshTokenVerify) throw new UnauthorizedError("Invalid refresh token")

        const tokenOnDB = await tokenRepository.getUserTokenByRefreshTokenRepository(refreshToken)

        if (!tokenOnDB) throw new UnauthorizedError

        if (new Date() > tokenOnDB.expiresAt) {
            await tokenRepository.deleteUserTokenByUserUuidRepository(refreshTokenVerify.sub)
            throw new UnauthorizedError("Refresh token expired")
        }

        const roles = await userRoleRepository.getRoleListByUserUUIDRepository(tokenOnDB.userUuid)

        const accessTokenPayload = {
            sub: tokenOnDB.userUuid,
            roles: roles.map(x => x.nama)
        }

        const accessToken = await accessTokenConfig.sign(accessTokenPayload)

        return {
            accessToken
        }
    },
    registerService: async (data: any, meta: any) => {
        meta.log.info(data, "SERVICE: userService.registerService called")

        const passwordHash = await Bun.password.hash(data.password, {
            algorithm: "bcrypt"
        })

        await userRepository.registerUserRepository({
            nama: data.nama,
            password: passwordHash,
            username: data.username,
            uuid: crypto.randomUUID()
        })
    },
    getUserInfoService: async (meta: any) => {
        meta.log.info("SERVICE: userService.getUserInfoService called")

        const data = await userRepository.getUserInfoRepository(meta.userUuid)

        if (!data) throw new BadRequestError

        return data
    },
    logoutService: async (meta: any) => {
        meta.log.info("SERVICE: userService.logoutService called")
        await tokenRepository.deleteUserTokenByUserUuidRepository(meta.userUuid)
    }
}
