import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: ["./src/apps/**/*.model.ts"],
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        url: `mysql://${Bun.env.DB_USER}:@${Bun.env.DB_HOST}:${Number(Bun.env.DB_PORT)}/${Bun.env.DB_NAME}`,
    },
});