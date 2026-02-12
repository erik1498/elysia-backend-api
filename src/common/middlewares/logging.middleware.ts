import Elysia from "elysia"
import { appLogger } from "../config/logging/logging.config"
import { RequestMeta } from "../types/context"

export const logMiddleware = (app: Elysia) => app
    .decorate("appLogger", appLogger)
    .derive({ as: 'global' }, ({ request, server, set, appLogger }) => {
        const clientRequestId = request.headers.get('x-request-id')

        const requestId = clientRequestId && clientRequestId.length < 50 ? clientRequestId : crypto.randomUUID()
        const ipAddress = server?.requestIP(request)?.address || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        set.headers['x-request-id'] = requestId

        const { pathname } = new URL(request.url)

        return {
            meta: {
                requestId,
                log: appLogger.child({ requestId }),
                userAgent,
                ipAddress,
                logPath: pathname,
                logMethod: request.method,
                startTime: performance.now()
            } as RequestMeta
        };

    })
    .onAfterResponse({ as: 'global' }, ({ set, meta }) => {
        if (meta) {
            const duration = (performance.now() - meta.startTime).toFixed(2)
            if (set.status as number < 400) {
                meta.log.info(`HTTP ${meta.logMethod} ${meta.logPath} - ${set.status} (${duration}ms)`)
            }
        }
    })