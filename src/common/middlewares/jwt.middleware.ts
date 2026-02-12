import Elysia from "elysia";
import { UnauthorizedError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";

export const jwtMiddleware = (app: Elysia) =>
    app
        .derive(async ({ accessTokenConfig, request, meta }: any) => {
            const auth = request.headers.get("authorization")

            if (!auth?.startsWith("Bearer ")) throw new UnauthorizedError

            const token = auth.slice(7)

            const isBlacklisted = await cache.exists(`bl:${token}`)
            if (isBlacklisted) throw new UnauthorizedError

            const payload = await accessTokenConfig.verify(token)

            if (!payload) throw new UnauthorizedError

            meta.userUuid = payload.sub
            meta.log = meta.log.child({ user: payload.sub })

            return {
                meta
            }
        })