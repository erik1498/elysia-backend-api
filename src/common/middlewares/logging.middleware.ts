import Elysia from "elysia";
import { appLogger } from "../config/logging/logging.config";
import { RequestMeta } from "../interface/context";

/**
 * Middleware responsible for Request Tracing, Context Initialization, and Performance Logging.
 * This middleware acts as the entry point for metadata generation and the exit point for response logging.
 * * * Core Responsibilities:
 * 1. **Request Tracing**: Generates or propagates a unique `x-request-id`.
 * 2. **Context Creation**: Initializes the {@link RequestMeta} object for downstream use.
 * 3. **Observability**: Logs the HTTP method, path, status code, and processing duration (latency).
 * * @param app - The Elysia application instance.
 */
export const logMiddleware = (app: Elysia) => app
    /**
     * Attaches the base logger instance to the Elysia application context.
     */
    .decorate("appLogger", appLogger)

    /**
     * Derives request-specific metadata.
     * Executes at the start of every request to prepare the tracing and logging environment.
     * * @returns An object containing the initial {@link RequestMeta}.
     */
    .derive({ as: 'global' }, ({ request, server, set, appLogger }) => {
        const clientRequestId = request.headers.get('x-request-id');

        // Propagate client request ID if valid and short, otherwise generate a new UUID
        const requestId = clientRequestId && clientRequestId.length < 50 
            ? clientRequestId 
            : crypto.randomUUID();

        const ipAddress = server?.requestIP(request)?.address || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Inject Request ID into Response Headers for client-side tracking
        set.headers['x-request-id'] = requestId;

        const { pathname } = new URL(request.url);

        return {
            meta: {
                requestId,
                // Create a child logger bound to this specific Request ID
                log: appLogger.child({ requestId }),
                userAgent,
                ipAddress,
                logPath: pathname,
                logMethod: request.method,
                // Record high-resolution start time for latency calculation
                startTime: performance.now()
            } as RequestMeta
        };
    })

    /**
     * Finalizes the request lifecycle by logging the result.
     * Calculates the total time elapsed from request entry to response delivery.
     * * @note Only logs successful requests (status < 400). 
     * Errors are handled separately by the errorMiddleware.
     */
    .onAfterResponse({ as: 'global' }, ({ set, meta }) => {
        if (meta) {
            const duration = (performance.now() - meta.startTime).toFixed(2);
            
            // Log informational summary for successful responses
            if (set.status as number < 400) {
                meta.log.info(
                    `HTTP ${meta.logMethod} ${meta.logPath} - ${set.status} (${duration}ms)`
                );
            }
        }
    });