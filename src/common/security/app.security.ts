import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { helmet } from "elysia-helmet";
import { sanitizerMiddleware } from "../middlewares/sanitizer.middleware";

export const securityPlugin = (app: Elysia) =>
    app
        .use(cors({
            origin: Bun.env.CORS_ORIGIN,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        }))
        .use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            },
            hidePoweredBy: true,
        }))
        .use(sanitizerMiddleware)

export const elysiaSecuritySetting = {
    serve: {
        maxRequestBodySize: 1024 * 1024 * 1
    }
}