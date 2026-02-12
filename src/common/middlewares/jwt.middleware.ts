import Elysia from "elysia";
import { UnauthorizedError } from "../errors/app.error";

export const jwtMiddleware = (app: Elysia) =>
    app
        .derive(async ({ accessTokenConfig, request, meta }: any) => {
            const auth = request.headers.get("authorization")

            if (!auth?.startsWith("Bearer ")) throw new UnauthorizedError

            const token = auth.slice(7)
            const payload = await accessTokenConfig.verify(token)

            if (!payload) throw new UnauthorizedError

            meta.userUuid = payload.sub
            meta.log = meta.log.child({ user: payload.sub })

            return {
                meta
            }
        })