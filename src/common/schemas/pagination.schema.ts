import { t } from "elysia";

export const PaginationQueryRequestSchema = t.Object({
    page: t.Numeric({
        default: 1
    }),
    size: t.Numeric({
        maximum: 100,
        minimum: 5,
        default: 5
    }),
    search: t.Optional(t.String()),
    filter: t.Optional(t.String({
        pattern: "^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+(;[a-zA-Z0-9_]+:[a-zA-Z0-9_]+)*$",
        error: "The filter format is invalid. Use 'field:value' or 'field:value;field:value' for multiple filters."
    })),
    sort: t.Optional(t.String({
        pattern: "^[a-zA-Z0-9_]+:(asc|desc|ASC|DESC)(;[a-zA-Z0-9_]+:(asc|desc|ASC|DESC))*$",
        error: "The sort format is invalid. Use 'field:direction' (asc/desc), e.g., 'price:desc' or 'price:desc;name:asc' for multiple sorting."
    }))
})

export const PaginatedResponseSchema = (dataSchema: any) => t.Object({
    success: t.Boolean({ default: true }),
    message: t.String(),
    data: t.Optional(t.Array(dataSchema)),
    meta: t.Optional(t.Object({
        page: t.Number(),
        size: t.Number(),
        totalItems: t.Number(),
        totalPages: t.Number(),
        hasNext: t.Boolean(),
        hasPrev: t.Boolean(),
        filterAllowedKeys: t.Array(t.String()),
        sortAllowedKeys: t.Array(t.String()),
    }))
});