import Elysia from "elysia";
import { BadRequestError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";

export const idempotencyMiddleware = (app: Elysia) =>
    app
        .onBeforeHandle(async ({ request, set, meta }: any) => {
            if (request.method === "POST") {
                const idmpKey = request.headers.get("x-idempotency-key");

                if (!idmpKey) {
                    throw new BadRequestError("x-idempotency-key header is required for POST requests")
                }

                const cachedResponse = await cache.get(`idmp:${idmpKey}`);
                if (cachedResponse) {
                    meta.log.info(`IDEMPOTENCY: Returning cached response for ${idmpKey}`);
                    set.status = 201
                    set.headers['x-idempotency-cache'] = 'HIT';
                    set.headers['x-idempotency-key'] = idmpKey
                    return JSON.parse(cachedResponse);
                }
            }
        })