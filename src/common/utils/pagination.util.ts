import { Static } from "elysia";
import { ValidationError } from "../errors/app.error";
import { PaginationQueryRequestSchema } from "../schemas/pagination.schema";

/**
 * Utility class for managing API pagination, filtering, and sorting logic.
 * Provides methods to parse domain-specific query strings and validate them against whitelists.
 */
export const PaginationUtil = {
    /**
     * Parses a semicolon-delimited string into a key-value object.
     * * @param input - The raw query string (e.g., "status:active;category:electronics")
     * @returns A record object (e.g., { status: "active", category: "electronics" })
     * * @example
     * PaginationUtil.queryToObject("price:desc;name:asc") // returns { price: "desc", name: "asc" }
     */
    queryToObject: (input?: string): Record<string, string> => {
        if (!input) return {};
        const result: Record<string, string> = {};

        input.split(';').forEach(pair => {
            const [key, value] = pair.split(':');
            if (key && value) result[key.trim()] = value.trim();
        });

        return result;
    },

    /**
     * Validates that all keys in a query string are present in an allowed whitelist.
     * Used primarily to prevent SQL injection or unauthorized filtering.
     * * @param params - Validation parameters
     * @param params.type - The category of the query (e.g., "filter" or "sort") for error reporting
     * @param params.allowedKeys - Array of strings representing permitted column names
     * @param params.query - The raw query string from the client
     * * @throws {ValidationError} If any key in the query is not present in the allowedKeys array.
     */
    keyOnQueryCheck: (params: { type: string, allowedKeys: string[], query: string }) => {
        const queryObject = PaginationUtil.queryToObject(params.query)

        Object.keys(queryObject).forEach((key) => {
            if (params.allowedKeys.indexOf(key) == -1) {
                throw new ValidationError([{
                    field: params.type,
                    message: `The field '${key}' is not allowed. Please use only supported fields: ${params.allowedKeys.join(', ')}.`
                }])
            }
        })
    },

    /**
     * Transforms a raw pagination query request into a structured object ready for service layers.
     * Converts 'filter' and 'sort' strings into mapped objects.
     * * @param query - The validated query object from Elysia
     * @returns The query object with parsed filter and sort properties
     */
    convertQueryToObject: (query: Static<typeof PaginationQueryRequestSchema>) => {
        const filter = PaginationUtil.queryToObject(query.filter)
        const sort = PaginationUtil.queryToObject(query.sort)

        return {
            ...query,
            filter,
            sort
        }
    }
}