import Elysia from "elysia";
import { ForbiddenError, UnauthorizedError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";
import { RequestMeta } from "../interface/context";

/**
 * Middleware for handling JWT Authentication and Role-Based Access Control (RBAC).
 * * This middleware performs three primary functions:
 * 1. **Authentication**: Verifies the Bearer token in the Authorization header.
 * 2. **Token Blacklisting**: Checks Redis to ensure the token has not been revoked.
 * 3. **Authorization**: Provides a 'roles' macro to restrict route access to specific user roles.
 * * @param app - The Elysia application instance.
 */
export const jwtMiddleware = (app: Elysia) =>
    app
        /**
         * A custom macro to enforce Role-Based Access Control (RBAC) at the route level.
         * * @param authorizedRoles - An array of strings representing roles allowed to access the route.
         * @example
         * ```typescript
         * app.get("/admin", () => "Hello Admin", { roles: ["ADMIN", "SUPER_ADMIN"] });
         * ```
         */
        .macro("roles", (authorizedRoles: string[]) => {
            return {
                /**
                 * Checks if the user's roles from the JWT payload intersect with the authorizedRoles.
                 * @throws {ForbiddenError} If the user does not possess any of the required roles.
                 */
                beforeHandle: ({ meta }: any) => {
                    const hasAccess = meta.userRoles.some((role: string) =>
                        authorizedRoles.includes(role)
                    )
                    if (!hasAccess) {
                        throw new ForbiddenError()
                    }
                }
            }
        })
        /**
         * Extracts, verifies, and processes the JWT from the Authorization header.
         * Updates the {@link RequestMeta} with user identification and roles.
         * * @throws {UnauthorizedError} If the header is missing, token is invalid, or token is blacklisted.
         */
        .derive(async ({ accessTokenConfig, request, meta }: any) => {
            const auth = request.headers.get("authorization")

            // 1. Validate Authorization Header Format
            if (!auth?.startsWith("Bearer ")) throw new UnauthorizedError()

            const token = auth.slice(7)

            // 2. Check Token Revocation List (Blacklist) in Redis
            const isBlacklisted = await cache.exists(`bl:${token}`)
            if (isBlacklisted) throw new UnauthorizedError()

            // 3. Verify JWT Signature and Expiration
            const payload = await accessTokenConfig.verify(token)
            if (!payload) throw new UnauthorizedError()

            // 4. Update Request Context with Auth Identity
            const authMeta = {
                ...meta,
                userUuid: payload.sub, // 'sub' typically holds the User UUID
                userRoles: payload.roles,
                // Create a child logger that includes the User UUID for all subsequent logs
                log: meta.log.child({ user: payload.sub })
            } as RequestMeta

            return {
                meta: authMeta
            }
        })