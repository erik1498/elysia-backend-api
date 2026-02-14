import { cache } from "../../../common/config/storage/redis.config"
import { AppUtil } from "../../../common/utils/app.util"
import { ApiResponseUtil } from "../../../common/utils/response.util"
import { userService } from "./user.service"

export const userHandler = {
    loginHandler: async ({ body, accessTokenConfig, refreshTokenConfig, set, meta }: any) => {
        meta.log.info("HANDLER: userHandler.loginHandler hit")

        const token = await userService.loginService(body, accessTokenConfig, refreshTokenConfig, meta)

        set.cookie = {
            refreshToken: {
                value: token.refreshToken,
                httpOnly: true,
                path: '/',
                secure: AppUtil.checkProductionType(),
                sameSite: 'lax',
            }
        }

        return ApiResponseUtil.success({
            data: token,
            message: "Login success"
        })
    },
    refreshUserHandler: async ({ cookie: { refreshToken }, accessTokenConfig, refreshTokenConfig, meta }: any) => {
        meta.log.info("HANDLER: userHandler.refreshUserHandler hit")

        const refreshTokenGet = refreshToken.value

        const token = await userService.refreshUserService(refreshTokenGet, accessTokenConfig, refreshTokenConfig, meta)

        refreshToken.set({
            value: token.refreshToken,
            httpOnly: true,
            path: '/',
            secure: AppUtil.checkProductionType(),
            sameSite: 'lax',
        })

        return ApiResponseUtil.success({
            data: token
        })
    },
    registerHandler: async ({ body, set, meta }: any) => {
        meta.log.info("HANDLER: userHandler.registerHandler hit")

        await userService.registerService(body, meta)

        set.status = 201
        return ApiResponseUtil.success({
            message: "Registered"
        })
    },
    getUserInfoHandler: async ({ meta }: any) => {
        meta.log.info("HANDLER: userHandler.getUserInfoHandler hit")

        const data = await userService.getUserInfoService(meta)

        return ApiResponseUtil.success({
            data
        })
    },
    logoutHandler: async ({ cookie: { refreshToken }, request: { headers }, set, meta }: any) => {
        meta.log.info("HANDLER: userHandler.logoutHandler hit")
        await userService.logoutService(meta)

        await refreshToken.remove()

        const token = headers.get("authorization").slice(7)

        await cache.set(`bl:${token}`, 'true', 'EX', 900)

        set.status = 204
    }
}