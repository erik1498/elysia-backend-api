import { Elysia } from "elysia";
import { apiRoutes } from "./routes";
import { checkDbConnection, db } from "./common/config/database/database.config";

const app = new Elysia()
    .use(apiRoutes)

const shutdown = async () => {
    console.log(`APPLICATION: Graceful shutdown START`)
    
    await app.stop()
    console.log(`APPLICATION: Request handler stoped`)

    await db.$client.end();
    console.log(`DATABASE: End connection`)

    process.exit(0);
};

const startServer = async () => {
    await checkDbConnection();

    app
        .listen(Number(Bun.env.PORT), (server) => {
            console.log(`APPLICATION: Running on http://${server?.hostname}:${server?.port}`)
        });
}

startServer();

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);