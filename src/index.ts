import { Elysia } from "elysia";
import { apiRoutes } from "./routes";
import { checkDbConnection, db } from "./common/config/database/database.config";
import { errorMiddleware } from "./common/middlewares/error.middleware";
import swagger from "@elysiajs/swagger";
import { appLogger } from "./common/config/logging/logging.config";
import { logMiddleware } from "./common/middlewares/logging.middleware";
import { jwtPlugin } from "./common/config/auth/jwt.config";
import { cache, checkRedisConnection } from "./common/config/storage/redis.config";
import { rateLimiter } from "./common/middlewares/rate-limit.middleware";
import { elysiaSecuritySetting, securityPlugin } from "./common/security/app.security";

const app = new 
    Elysia(elysiaSecuritySetting)
    .use(securityPlugin)
    .use(swagger({
        path: '/docs',
        documentation: {
            info: {
                title: 'Backend API Barang Documentation',
                version: '1.0.0',
                description: 'Dokumentasi lengkap untuk manajemen data barang'
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        },
    }))
    .use(rateLimiter("app", 80, 60))
    .use(jwtPlugin)
    .use(logMiddleware)
    .use(errorMiddleware)
    .use(apiRoutes)

const shutdown = async () => {
    appLogger.info(`APPLICATION: Graceful shutdown START`)

    await app.stop()
    appLogger.info(`APPLICATION: Request handler stoped`)

    await db.$client.end();
    appLogger.info(`DATABASE: End connection`)

    cache.close();
    appLogger.info(`REDIS: End connection`)

    process.exit(0);
};

const startServer = async () => {
    await checkDbConnection();

    await checkRedisConnection();

    app
        .listen(Number(Bun.env.PORT), (server) => {
            appLogger.info(`APPLICATION: Running on http://${server?.hostname}:${server?.port}`)
        });
}

startServer();

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);