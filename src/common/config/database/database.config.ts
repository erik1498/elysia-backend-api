import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { appLogger } from "../logging/logging.config";

const pool = createPool({
    uri: `mysql://${Bun.env.DB_USER}:@${Bun.env.DB_HOST}:${Number(Bun.env.DB_PORT)}/${Bun.env.DB_NAME}`,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const db = drizzle(pool, {
    logger: true
});

export const checkDbConnection = async () => {
    try {
        appLogger.info("DATABASE: Checking connection...")
        const connection = await pool.getConnection();
        appLogger.info("DATABASE: Connected successfully!");
        connection.release();
    } catch (error) {
        appLogger.info("DATABASE: connection failed:");
        appLogger.error(error)
        process.exit(1);
    }
};