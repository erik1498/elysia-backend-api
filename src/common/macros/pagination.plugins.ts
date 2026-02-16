import Elysia from "elysia";
import { PaginationUtil } from "../utils/pagination.util";

/**
 * A custom Elysia Macro that provides automated validation for pagination queries.
 * It ensures that any 'filter' or 'sort' keys sent by the client are explicitly 
 * allowed by the route configuration to prevent unauthorized data exposure or SQL errors.
 * * @param app - The Elysia application instance.
 * @example
 * ```typescript
 * app.get("/items", () => { ... }, {
 * paginationQueryValidate: {
 * filterKeys: ["name", "category"],
 * sortKeys: ["createdAt"]
 * }
 * });
 * ```
 */
export const paginationQueryMacro = (app: Elysia) =>
    app
        .macro("paginationQueryValidate", (params: {
            /** Array of column keys allowed to be used in the 'filter' query parameter */
            filterKeys?: string[],
            /** Array of column keys allowed to be used in the 'sort' query parameter */
            sortKeys?: string[]
        }) => {
            return {
                /**
                 * Intercepts the request before the handler is executed to validate query keys.
                 * @throws {BadRequestError} If a query key is used that is not present in the allowedKeys array.
                 */
                beforeHandle: ({ query }: any) => {
                    // Validate filter query keys if constraints are defined
                    if (params.filterKeys) {
                        PaginationUtil.keyOnQueryCheck({
                            type: "filter",
                            query: query.filter,
                            allowedKeys: params.filterKeys
                        });
                    }

                    // Validate sort query keys if constraints are defined
                    if (params.sortKeys) {
                        PaginationUtil.keyOnQueryCheck({
                            type: "sort",
                            query: query.sort,
                            allowedKeys: params.sortKeys
                        });
                    }
                }
            };
        });