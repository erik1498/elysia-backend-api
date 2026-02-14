import { t } from "elysia";

export const IdempotencyHeaderSchema = t.Object({
    "x-idempotency-key": t.String({
        description: "Unique UUID for idempotency. Prevents duplicate data on retry.",
        format: "uuid",
        error: "x-idempotency-key header is required for POST requests"
    })
})