import Elysia from "elysia";
import { ForbiddenError, UnauthorizedError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";
import { RequestMeta } from "../interface/context";

export const jwtMiddleware = (app: Elysia) =>
    app
        .macro("roles", (authorizedRoles: string[]) => {
            return {
                beforeHandle: ({ meta }: any) => {
                    const hasAccess = meta.userRoles.some((role: string) =>
                        authorizedRoles.includes(role)
                    )
                    if (!hasAccess) {
                        throw new ForbiddenError
                    }
                }
            }
        })
        .derive(async ({ accessTokenConfig, request, meta }: any) => {
            const auth = request.headers.get("authorization")

            if (!auth?.startsWith("Bearer ")) throw new UnauthorizedError

            const token = auth.slice(7)

            const isBlacklisted = await cache.exists(`bl:${token}`)
            if (isBlacklisted) throw new UnauthorizedError

            const payload = await accessTokenConfig.verify(token)

            if (!payload) throw new UnauthorizedError

            const authMeta = {
                ...meta,
                userUuid: payload.sub,
                userRoles: payload.roles,
                log: meta.log.child({ user: payload.sub })
            } as RequestMeta

            return {
                meta: authMeta
            }
        })