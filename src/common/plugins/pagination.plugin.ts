import Elysia from "elysia";
import { PaginationUtil } from "../utils/pagination.util";

export const paginationPlugin = (app: Elysia) =>
    app
        .macro("paginationQueryValidate", (params: {
            filterKeys?: string[],
            sortKeys?: string[]
        }) => {
            return {
                beforeHandle: ({ query }: any) => {
                    if (params.filterKeys) {
                        PaginationUtil.keyOnQueryCheck({
                            type: "filter",
                            query: query.filter,
                            allowedKeys: params.filterKeys
                        })
                    }
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