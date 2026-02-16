import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { appLogger } from "../logging/logging.config";

/**
 * MySQL Connection Pool configuration.
 * Managed via mysql2/promise to handle asynchronous connection threading.
 * * **Key Settings**:
 * - `connectionLimit: 10`: Limits the number of concurrent connections to prevent database exhaustion.
 * - `waitForConnections: true`: Ensures requests wait for a free connection rather than failing immediately.
 */
const pool = createPool({
    uri: `mysql://${Bun.env.DB_USER}:@${Bun.env.DB_HOST}:${Number(Bun.env.DB_PORT)}/${Bun.env.DB_NAME}`,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * The Drizzle ORM instance.
 * This is the primary entry point for all database queries throughout the application.
 */
export const db = drizzle(pool);

/**
 * Validates the database connectivity on application startup.
 * If the connection cannot be established, the process will log the error and exit 
 * to prevent the application from running in a "zombie" state.
 * * @throws Will log an error and call `process.exit(1)` if the connection fails.
 */
export const checkDbConnection = async () => {
    try {
        appLogger.info("DATABASE: Checking connection...")
        
        // Attempt to acquire a connection from the pool
        const connection = await pool.getConnection();
        
        appLogger.info("DATABASE: Connected successfully!");
        
        // Always release the connection back to the pool
        connection.release();
    } catch (error) {
        appLogger.info("DATABASE: connection failed:");
        appLogger.error(error)
        
        // Critical failure: Stop the server if the database is unreachable
        process.exit(1);
    }
};