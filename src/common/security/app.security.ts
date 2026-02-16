import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { helmet } from "elysia-helmet";
import { sanitizerMiddleware } from "../middlewares/sanitizer.middleware";

/**
 * A centralized security plugin that implements multiple layers of protection.
 * It configures Cross-Origin Resource Sharing (CORS), secure HTTP headers (Helmet),
 * input sanitization, and a global 404 fallback.
 * * * **Layers of Defense**:
 * 1. **CORS**: Restricts API access to authorized origins only.
 * 2. **Helmet**: Protects against common web vulnerabilities (XSS, Clickjacking, etc.).
 * 3. **Sanitization**: Recursively cleans incoming payloads to remove malicious scripts.
 * 4. **Routing Guard**: Ensures a standard JSON error response for undefined routes.
 * * @param app - The Elysia application instance.
 */
export const securityPlugin = (app: Elysia) =>
    app
        /**
         * Global Fallback Route.
         * Catches all requests to undefined endpoints and returns a standardized 404 response.
         */
        .all("*", ({ set }) => {
            set.status = 404;
            return {
                success: false,
                code: "NOT_FOUND",
                message: `Not Found`
            };
        })

        /**
         * Configures Cross-Origin Resource Sharing.
         * Uses environment variables to define the 'origin' for production safety.
         */
        .use(cors({
            origin: Bun.env.CORS_ORIGIN, // e.g., https://your-frontend.com
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        }))

        /**
         * Secures the app by setting various HTTP headers.
         * - Disables 'X-Powered-By' to hide server technology.
         * - Configures a strict Content Security Policy (CSP).
         */
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

        /**
         * Cleans incoming request bodies (POST/PUT) from malicious code.
         * See {@link sanitizerMiddleware} for implementation details.
         */
        .use(sanitizerMiddleware)

/**
 * Server-level security settings for the Bun runtime.
 */
export const elysiaSecuritySetting = {
    serve: {
        /** * Limits the maximum request body size to 1MB.
         * Prevents Denial of Service (DoS) attacks via excessively large payloads.
         */
        maxRequestBodySize: 1024 * 1024 * 1
    }
}