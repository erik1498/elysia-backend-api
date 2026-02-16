/**
 * Represents the metadata context for a single incoming request.
 * This interface is typically populated by middlewares (Auth, Logging, Trace)
 * and is passed through Services and Repositories for auditing and logging purposes.
 */
export interface RequestMeta {
    /** * The logger instance for the current request context.
     * Usually contains pre-bound metadata like requestId and userUuid.
     */
    log: any;

    /** The User-Agent string identifying the client application/browser */
    userAgent: string;

    /** The unique identifier of the authenticated user (from JWT/Session) */
    userUuid: string;

    /** List of roles/permissions assigned to the authenticated user */
    userRoles: string[];

    /** * Unique key used to prevent duplicate processing of the same request.
     * Extracted from the 'x-idempotency-key' header.
     */
    idempotencyKey: string;

    /** The origin IP address of the client making the request */
    ipAddress: string;

    /** * A unique Trace ID (UUID) assigned to the request for log correlation.
     * Often sourced from the 'x-request-id' header.
     */
    requestId: string;

    /** The URL path of the request (e.g., "/v1/items/123") */
    logPath: string;

    /** The HTTP method used (e.g., "GET", "POST", "PUT", "DELETE") */
    logMethod: string;

    /** * High-resolution timestamp of when the request entered the system.
     * Used to calculate total processing duration (Latency).
     */
    startTime: number;
}