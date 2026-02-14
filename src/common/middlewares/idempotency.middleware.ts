import Elysia from "elysia";
import { BadRequestError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";
import { RequestMeta } from "../interface/context";

export const idempotencyMiddleware = (app: Elysia) =>
    app
        .derive(({ request, meta }: any) => {
            if (request.method === "POST") {
                const idempotencyKey = request.headers.get("x-idempotency-key");

                if (!idempotencyKey) {
                    throw new BadRequestError("x-idempotency-key header is required for POST requests")
                }

                meta.log = meta.log.child({ idempotencyKey })

                const idempotencyMeta = {
                    ...meta,
                    idempotencyKey
                } as RequestMeta

                return {
                    meta: idempotencyMeta
                }
            }
        })
        .onBeforeHandle(async ({ request, set, meta }: any) => {
            if (request.method === "POST") {
                const cachedResponse = await cache.get(`idmp:${meta.idempotencyKey}`);
                if (cachedResponse) {
                    meta.log.info(`IDEMPOTENCY: Returning cached response`);
                    set.status = 201
                    set.headers['x-idempotency-cache'] = 'HIT';
                    set.headers['x-idempotency-key'] = meta.idempotencyKey
                    return JSON.parse(cachedResponse);
                }
            }
        })