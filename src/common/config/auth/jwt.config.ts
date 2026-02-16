import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

/**
 * Configuration for the Short-Lived Access Token.
 * * **Expiry**: 5 minutes ('5m')
 * **Purpose**: Used for authorizing immediate requests. 
 * Small expiry window minimizes the risk if a token is intercepted.
 */
export const accessTokenConfig = jwt({
    name: "accessTokenConfig",
    secret: Bun.env.JWT_ACCESS_TOKEN_SECRET || 'secret-key',
    exp: '5m'
})

/**
 * Configuration for the Long-Lived Refresh Token.
 * * **Expiry**: 7 days ('7d')
 * **Purpose**: Used to obtain a new Access Token without requiring 
 * the user to re-authenticate with credentials.
 */
export const refreshTokenConfig = jwt({
    name: "refreshTokenConfig",
    secret: Bun.env.JWT_REFRESH_TOKEN_SECRET || 'secret-key',
    exp: '7d'
})

/**
 * A plugin that registers the JWT configurations into the Elysia application.
 * This makes `accessTokenConfig` and `refreshTokenConfig` available 
 * within the context of handlers and other middlewares (e.g., jwtMiddleware).
 * * @param app - The Elysia application instance.
 */
export const jwtPlugin = (app: Elysia) =>
    app
        .use(accessTokenConfig)
        .use(refreshTokenConfig)