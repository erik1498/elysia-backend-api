import { t } from "elysia";

/**
 * Validation schema for pagination, filtering, and sorting query parameters.
 * This schema enforces strict data types and string patterns to ensure 
 * compatibility with the database query builder.
 */
export const PaginationQueryRequestSchema = t.Object({
    /** The requested page number. Defaults to 1. */
    page: t.Numeric({
        default: 1
    }),

    /** * The number of items per page. 
     * Constraints: Min 5, Max 100. Defaults to 5. 
     */
    size: t.Numeric({
        maximum: 100,
        minimum: 5,
        default: 5
    }),

    /** Global search string to be matched against allowed searchable columns. */
    search: t.Optional(t.String()),

    /** * Dynamic filter string.
     * **Format**: `field:value` or `field1:value1;field2:value2`
     * @example "category:electronics;status:active"
     */
    filter: t.Optional(t.String({
        pattern: "^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+(;[a-zA-Z0-9_]+:[a-zA-Z0-9_]+)*$",
        error: "The filter format is invalid. Use 'field:value' or 'field:value;field:value' for multiple filters."
    })),

    /** * Dynamic sort string.
     * **Format**: `field:direction` (asc/desc) or `field1:asc;field2:desc`
     * @example "createdAt:desc;name:asc"
     */
    sort: t.Optional(t.String({
        pattern: "^[a-zA-Z0-9_]+:(asc|desc|ASC|DESC)(;[a-zA-Z0-9_]+:(asc|desc|ASC|DESC))*$",
        error: "The sort format is invalid. Use 'field:direction' (asc/desc), e.g., 'price:desc' or 'price:desc;name:asc' for multiple sorting."
    }))
})

/**
 * A higher-order schema that generates a standardized paginated response structure.
 * Wraps the specific entity data schema with metadata for client-side navigation.
 * * @param dataSchema - The TypeBox/Elysia schema for the individual data items.
 * @returns A structured object containing the success status, message, data array, and pagination metadata.
 */
export const PaginatedResponseSchema = (dataSchema: any) => t.Object({
    /** Indicates if the request was successful. */
    success: t.Boolean({ default: true }),

    /** Human-readable status message. */
    message: t.String(),

    /** The array of records returned for the current page. */
    data: t.Optional(t.Array(dataSchema)),

    /** * Metadata providing context for the paginated results.
     * Includes navigation flags and current constraints.
     */
    meta: t.Optional(t.Object({
        page: t.Number(),
        size: t.Number(),
        totalItems: t.Number(),
        totalPages: t.Number(),
        hasNext: t.Boolean(),
        hasPrev: t.Boolean(),
        /** List of keys currently permitted for filtering on this entity. */
        filterAllowedKeys: t.Array(t.String()),
        /** List of keys currently permitted for sorting on this entity. */
        sortAllowedKeys: t.Array(t.String()),
    }))
});