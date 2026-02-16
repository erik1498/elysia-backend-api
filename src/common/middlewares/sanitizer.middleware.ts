import { Elysia } from 'elysia';
import { SecurityUtil } from '../utils/security.util';

/**
 * Middleware for sanitizing incoming request payloads to prevent XSS and injection attacks.
 * This middleware automatically intercepts 'POST' and 'PUT' requests to clean the request body.
 * * * **Key Features**:
 * 1. **Security Enhancement**: Strips malicious scripts or HTML tags from input data.
 * 2. **Recursive Cleaning**: Typically processes nested objects and arrays within the body.
 * 3. **In-place Mutation**: Updates the existing body object to ensure downstream handlers receive clean data.
 * * @param app - The Elysia application instance.
 */
export const sanitizerMiddleware = (app: Elysia) =>
    /**
     * Executes before the route handler logic.
     * Only targets methods that typically carry a data payload (POST, PUT).
     */
    app.onBeforeHandle(({ body, request }) => {
        if (['POST', 'PUT'].includes(request.method) && body) {
            /**
             * Processes the raw body through {@link SecurityUtil.sanitizeData}.
             * This utility should handle escaping or removing dangerous characters/tags.
             */
            const cleanBody = SecurityUtil.sanitizeData(body);
            
            /**
             * Merges the sanitized data back into the original body object.
             * Object.assign is used to maintain the reference of the body object 
             * throughout the Elysia request lifecycle.
             */
            Object.assign(body, cleanBody);
        }
    });