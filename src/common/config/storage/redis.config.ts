import { RedisClient } from "bun";
import Elysia from "elysia";
import { appLogger } from "../logging/logging.config";

export const cache = new RedisClient(Bun.env.REDIS_URL || "redis://localhost:6379");

export const checkRedisConnection = async () => {
    try {
        appLogger.info("REDIS: Checking connection...");
        const pong = await cache.ping(); 
        
        if (pong === "PONG") {
            appLogger.info("REDIS: Connected successfully!");
        }
    } catch (error) {
        appLogger.error("REDIS: Connection failed:");
        appLogger.error(error);
        process.exit(1); 
    }
};

export const redisPlugin = (app: Elysia) => app.decorate("cache", cache);