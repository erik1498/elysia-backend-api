import { t } from "elysia";

/**
 * A higher-order schema that generates a standardized base response structure.
 * This is used for single-entity operations (e.g., Get by UUID, Create, Update) 
 * to ensure that every API response follows the same root structure.
 * * * @param data - The TypeBox/Elysia schema for the payload being returned.
 * @returns A structured object containing success status, message, and the data payload.
 * * @example
 * ```typescript
 * // Using it in a route definition
 * .get("/profile", handler, {
 * response: BaseResponseSchema(UserSchema)
 * })
 * ```
 */
export const BaseResponseSchema = (data: any) => t.Object({
    /** Indicates whether the operation was successful. */
    success: t.Boolean(),

    /** A descriptive status message for the client. */
    message: t.String(),

    /** The actual payload of the response. Can be an object, string, or null. */
    data: data
});