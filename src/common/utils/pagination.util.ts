import { ValidationError } from "../errors/app.error";

export const PaginationUtil = {
    queryToObject: (input: string) => {
        if (!input) return {};
        const result: Record<string, string> = {};

        input.split(';').forEach(pair => {
            const [key, value] = pair.split(':');
            if (key && value) result[key.trim()] = value.trim();
        });

        return result;
    },
    keyOnQueryCheck: (params: { type: string, allowedKeys: string[], query: string }) => {
        if (params.allowedKeys.length === 0) {
            throw new ValidationError([{
                field: params.type,
                message: `${params.type} is currently disabled for this resource.`
            }])
        }

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
    convertQueryToObject: (query: any) => {
        query.filter = PaginationUtil.queryToObject(query.filter)
        query.sort = PaginationUtil.queryToObject(query.sort)

        return query
    }
}