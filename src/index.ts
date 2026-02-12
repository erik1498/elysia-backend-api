import { Elysia } from "elysia";
import { apiRoutes } from "./routes";
import { checkDbConnection, db } from "./common/config/database/database.config";
import { errorMiddleware } from "./common/middlewares/error.middleware";
import swagger from "@elysiajs/swagger";

const app = new Elysia()
    .use(swagger({ 
        path: '/docs',
        documentation: {
            info: {
                title: 'Backend API Barang Documentation',
                version: '1.0.0',
                description: 'Dokumentasi lengkap untuk manajemen data barang'
            }
        }
    }))
    .use(errorMiddleware)
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