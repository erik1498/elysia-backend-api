import { t } from "elysia";

/**
 * Validation schema for the Idempotency Header.
 * This schema ensures that clients provide a valid, unique identifier 
 * when performing sensitive write operations (typically POST requests).
 * * * **Key Constraints**:
 * 1. **Required**: The request will fail if the header is missing.
 * 2. **Format**: Must be a valid UUID v4 string.
 * 3. **Validation Error**: Provides a clear, descriptive error message if validation fails.
 * * @example
 * ```typescript
 * app.post("/orders", handler, {
 * headers: IdempotencyHeaderSchema
 * });
 * ```
 */
export const IdempotencyHeaderSchema = t.Object({
    /** * The 'x-idempotency-key' header.
     * Used by the {@link idempotencyMiddleware} to cache and retrieve responses.
     */
    "x-idempotency-key": t.String({
        description: "Unique UUID for idempotency. Prevents duplicate data on retry.",
        format: "uuid",
        error: "x-idempotency-key header is required for POST requests"
    })
})