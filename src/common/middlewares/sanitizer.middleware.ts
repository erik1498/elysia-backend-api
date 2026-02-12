import { Elysia } from 'elysia';
import { SecurityUtil } from '../utils/security.util';

export const sanitizerMiddleware = (app: Elysia) =>
    app.onBeforeHandle(({ body, request }) => {
        if (['POST', 'PUT'].includes(request.method) && body) {
            const cleanBody = SecurityUtil.sanitizeData(body);
            Object.assign(body, cleanBody);
        }
    });