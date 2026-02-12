import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const accessTokenConfig = jwt({
    name: "accessTokenConfig",
    secret: Bun.env.JWT_ACCESS_TOKEN_SECRET || 'secret-key',
    exp: '15m'
})

export const refreshTokenConfig = jwt({
    name: "refreshTokenConfig",
    secret: Bun.env.JWT_REFRESH_TOKEN_SECRET || 'secret-key',
    exp: '7d'
})

export const jwtPlugin = (app: Elysia) =>
    app
        .use(accessTokenConfig)
        .use(refreshTokenConfig)