import Elysia from "elysia";
import { TooManyRequestError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";

/**
 * A higher-order middleware function that implements Rate Limiting using a Redis backend.
 * This middleware prevents API abuse by limiting the number of requests a user or IP can make 
 * within a specific time window.
 * * * **Identification Strategy**: 
 * 1. Prioritizes `meta.userUuid` for authenticated users.
 * 2. Falls back to `meta.ipAddress` for anonymous users.
 * * @param groupName - A unique identifier for the rate limit bucket (e.g., "auth", "inventory").
 * @param limit - The maximum number of requests allowed within the duration.
 * @param duration - The time window in seconds (TTL for the Redis key).
 * * @example
 * ```typescript
 * app.use(rateLimiter("public-api", 60, 60)) // Allow 60 requests per minute
 * ```
 */
export const rateLimiter = (groupName: string, limit: number, duration: number) => (app: Elysia) =>
    app
        /**
         * Executed before the route handler. 
         * Manages the increment logic in Redis and sets RateLimit headers.
         * * @throws {TooManyRequestError} If the current request count exceeds the defined limit.
         */
        .onBeforeHandle(async ({ set, meta }: any) => {
            // Identify user: prioritize UUID over IP to prevent rate-limiting 
            // entire networks (NAT) for authenticated users.
            const id = meta.userUuid || meta.ipAddress;
            const key = `rl:${groupName}:${id}`;

            // Increment the counter in Redis
            const current = await cache.incr(key);

            // If it's a new window (counter is 1), set the expiration
            if (current === 1) {
                await cache.expire(key, duration);
            }

            const ttl = await cache.ttl(key);
            const remaining = Math.max(0, limit - current);

            // Standard RateLimit Headers (IETF Draft)
            set.headers['RateLimit-Limit'] = limit.toString();
            set.headers['RateLimit-Remaining'] = remaining.toString();
            set.headers['RateLimit-Reset'] = ttl.toString();

            // Custom header for debugging which group triggered the limit
            set.headers['X-RateLimit-Group'] = groupName;

            /**
             * Check if the limit has been exceeded.
             * If exceeded, provide a Retry-After header for client-side backoff logic.
             */
            if (current > limit) {
                set.headers['Retry-After'] = ttl.toString();
                throw new TooManyRequestError();
            }
        });