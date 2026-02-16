import Elysia from "elysia";
import { PaginationUtil } from "../utils/pagination.util";

/**
 * A plugin that extends Elysia with advanced pagination and query validation capabilities.
 * It provides a specialized macro to whitelist allowed filter and sort keys, protecting
 * the application from malicious query injections or invalid database column references.
 * * @param app - The Elysia application instance.
 */
export const paginationPlugin = (app: Elysia) =>
    app
        /**
         * Macro for validating query parameters against a whitelist of allowed keys.
         * * @param params - Configuration object for validation.
         * @param params.filterKeys - An array of column names permitted for filtering.
         * @param params.sortKeys - An array of column names permitted for sorting.
         * * @example
         * ```typescript
         * app.get("/users", () => {...}, {
         * paginationQueryValidate: {
         * filterKeys: ["name", "email", "role"],
         * sortKeys: ["createdAt", "name"]
         * }
         * })
         * ```
         */
        .macro("paginationQueryValidate", (params: {
            filterKeys?: string[],
            sortKeys?: string[]
        }) => {
            return {
                /**
                 * Intercepts the request before the handler logic is executed.
                 * Uses {@link PaginationUtil.keyOnQueryCheck} to verify if the 
                 * incoming 'filter' and 'sort' query parameters match the allowed keys.
                 * * @throws {BadRequestError} If the client attempts to filter or sort by a restricted key.
                 */
                beforeHandle: ({ query }: any) => {
                    // Validate filterable columns
                    if (params.filterKeys) {
                        PaginationUtil.keyOnQueryCheck({
                            type: "filter",
                            query: query.filter,
                            allowedKeys: params.filterKeys
                        })
                    }

                    // Validate sortable columns
                    if (params.sortKeys) {
                        PaginationUtil.keyOnQueryCheck({
                            type: "sort",
                            query: query.sort,
                            allowedKeys: params.sortKeys
                        })
                    }
                }
            }
        })