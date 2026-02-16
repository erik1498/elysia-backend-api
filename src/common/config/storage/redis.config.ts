import { RedisClient } from "bun";
import { appLogger } from "../logging/logging.config";

/**
 * The Global Redis Cache instance.
 * Utilizing Bun's native high-performance Redis client.
 * * **Primary Use Cases**:
 * 1. **Idempotency**: Storing processed request keys to prevent duplicates.
 * 2. **Rate Limiting**: Tracking request counts per User/IP.
 * 3. **Token Blacklisting**: Storing revoked JWTs.
 */
export const cache = new RedisClient(Bun.env.REDIS_URL || "redis://localhost:6379");

/**
 * Validates the Redis connectivity on application startup.
 * Performs a PING-PONG handshake to ensure the caching layer is operational.
 * * * @throws Will log a critical error and call `process.exit(1)` if Redis is unreachable,
 * as the application's security (Rate Limiting) and reliability (Idempotency) 
 * depend on this service.
 */
export const checkRedisConnection = async () => {
    try {
        appLogger.info("REDIS: Checking connection...");
        
        // Execute a ping command to verify the server is alive
        const pong = await cache.ping(); 
        
        if (pong === "PONG") {
            appLogger.info("REDIS: Connected successfully!");
        }
    } catch (error) {
        appLogger.error("REDIS: Connection failed:");
        appLogger.error(error);
        
        // Exit process if a core dependency is missing
        process.exit(1); 
    }
};