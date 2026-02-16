import { Static } from "elysia";
import { ValidationError } from "../errors/app.error";
import { PaginationQueryRequestSchema } from "../schemas/pagination.schema";

export const PaginationUtil = {
    queryToObject: (input?: string) => {
        if (!input) return {};
        const result: Record<string, string> = {};

        input.split(';').forEach(pair => {
            const [key, value] = pair.split(':');
            if (key && value) result[key.trim()] = value.trim();
        });

        return result;
    },
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