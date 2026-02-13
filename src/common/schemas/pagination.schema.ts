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
        examples: ["nama:nike;status:tersedia"],
        error: "The filter format is invalid. Use 'field:value' or 'field:value;field:value' for multiple filters."
    })),
    sort: t.Optional(t.String({ 
        pattern: "^[a-zA-Z0-9_]+:(asc|desc|ASC|DESC)(;[a-zA-Z0-9_]+:(asc|desc|ASC|DESC))*$",
        examples: ["harga:desc;nama:asc"],
        error: "The sort format is invalid. Use 'field:direction' (asc/desc), e.g., 'price:desc' or 'price:desc;name:asc' for multiple sorting."
    }))
})

export const MetaSchema = t.Object({
    page: t.Number(),
    limit: t.Number(),
    total_items: t.Number(),
    total_pages: t.Number(),
    has_next: t.Boolean(),
    has_prev: t.Boolean(),
});

export const PaginatedResponseSchema = (dataSchema: any) => t.Object({
    success: t.Boolean({ default: true }),
    message: t.String(),
    data: t.Array(dataSchema),
    meta: MetaSchema
});