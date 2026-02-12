import Elysia from "elysia";
import { TooManyRequestError } from "../errors/app.error";
import { cache } from "../config/storage/redis.config";

export const rateLimiter = (groupName: string, limit: number, duration: number) => (app: Elysia) =>
    app
        .decorate("cache", cache)
        .onBeforeHandle(async ({ request, set, cache, meta }: any) => {
            const id = meta.userUuid || request.headers.get('x-forwarded-for') || 'anonymous';

            const key = `rl:${groupName}:${id}`;

            const current = await cache.incr(key);

            if (current === 1) {
                await cache.expire(key, duration);
            }

            const ttl = await cache.ttl(key);

            const remaining = Math.max(0, limit - current);

            set.headers['RateLimit-Limit'] = limit.toString();
            set.headers['RateLimit-Remaining'] = remaining.toString();
            set.headers['RateLimit-Reset'] = ttl.toString();

            set.headers['X-RateLimit-Group'] = groupName;

            if (current > limit) {
                set.headers['Retry-After'] = ttl.toString();
                throw new TooManyRequestError
            }
        })