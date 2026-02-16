import Elysia from "elysia";
import { BadRequestError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";
import { RequestMeta } from "../interface/context";

/**
 * Middleware to handle Idempotency for POST requests.
 * Idempotency ensures that making the same request multiple times has the same 
 * effect as making it once, preventing accidental duplicate resource creation.
 * * * Flow:
 * 1. Checks for 'x-idempotency-key' in POST request headers.
 * 2. Injects the key into the {@link RequestMeta} context.
 * 3. Before handling the route, checks Redis for a cached response.
 * 4. If found, returns the cached response immediately with an 'x-idempotency-cache: HIT' header.
 * * @param app - The Elysia application instance.
 */
export const idempotencyMiddleware = (app: Elysia) =>
    app
        /**
         * Extracts and validates the idempotency key from headers.
         * Updates the logger context and metadata for downstream services.
         * @throws {BadRequestError} If the 'x-idempotency-key' header is missing on a POST request.
         */
        .derive(({ request, meta }: any) => {
            if (request.method === "POST") {
                const idempotencyKey = request.headers.get("x-idempotency-key");

                if (!idempotencyKey) {
                    throw new BadRequestError("x-idempotency-key header is required for POST requests")
                }

                // Add idempotencyKey to the logger child instance for better traceability
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
        /**
         * Checks the Redis cache for previously processed requests using the idempotency key.
         * If a hit is found, it short-circuits the request and returns the saved result.
         */
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