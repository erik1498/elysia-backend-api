import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";

const pool = createPool({
    uri: `mysql://${Bun.env.DB_USER}:@${Bun.env.DB_HOST}:${Number(Bun.env.DB_PORT)}/${Bun.env.DB_NAME}`,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const db = drizzle(pool);

export const checkDbConnection = async () => {
    try {
        console.log("DATABASE: Checking connection...");
        const connection = await pool.getConnection();
        console.log("DATABASE: Connected successfully!");
        connection.release();
    } catch (error) {
        console.log("DATABASE: connection failed:");
        console.error(error)
        process.exit(1);
    }
};