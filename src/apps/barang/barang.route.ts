import { BarangBodySchema, BarangResponseSchema } from "./barang.schema";
import { BaseResponseSchema } from "../../common/schemas/response.schema";
import Elysia, { t } from "elysia";
import { barangHandler } from "./barang.handler";
import { jwtMiddleware } from "../../common/middlewares/jwt.middleware";
import { rateLimiter } from "../../common/middlewares/rate-limit.middleware";
import { paginationQueryMacro } from "../../common/macros/pagination.plugins";
import { PaginatedResponseSchema, PaginationQueryRequestSchema } from "../../common/schemas/pagination.schema";
import { IdempotencyHeaderSchema } from "../../common/schemas/idempotency.schema";
import { idempotencyMiddleware } from "../../common/middlewares/idempotency.middleware";

export const barangRoute = (app: Elysia) => {
    return app
        .group("/barang", (group) =>
            group
                .use(idempotencyMiddleware)
                .use(jwtMiddleware)
                .use(paginationQueryMacro)
                .use(rateLimiter("barang", 60, 60))
                .get("/", barangHandler.getAllBarangHandler, {
                    query: PaginationQueryRequestSchema,
                    paginationQueryValidate: {
                        filterKeys: ["harga"],
                        sortKeys: ["harga", "nama"]
                    },
                    detail: {
                        tags: ["Barang"],
                        summary: "Get All Data Barang"
                    },
                    response: {
                        200: PaginatedResponseSchema(BarangResponseSchema)
                    }
                })
                .get("/:uuid", barangHandler.getBarangByUuidHandler, {
                    params: t.Object({
                        uuid: t.String({ format: 'uuid' })
                    }),
                    detail: {
                        tags: ["Barang"],
                        summary: "Get Data Barang"
                    },
                    response: {
                        200: BaseResponseSchema(BarangResponseSchema)
                    }
                })
                .post("/", barangHandler.createBarangHandler, {
                    roles: ["super_admin"],
                    body: BarangBodySchema,
                    headers: IdempotencyHeaderSchema,
                    detail: {
                        tags: ["Barang"],
                        summary: "Create Data Barang"
                    },
                    response: {
                        201: BaseResponseSchema(BarangResponseSchema)
                    }
                })
                .put("/:uuid", barangHandler.updateBarangHandler, {
                    roles: ["super_admin"],
                    params: t.Object({
                        uuid: t.String({ format: 'uuid' })
                    }),
                    body: BarangBodySchema,
                    detail: {
                        tags: ["Barang"],
                        summary: "Update Data Barang"
                    },
                    response: {
                        200: BaseResponseSchema(BarangResponseSchema)
                    }
                })
                .delete("/:uuid", barangHandler.deleteBarangHandler, {
                    roles: ["super_admin"],
                    params: t.Object({
                        uuid: t.String({ format: 'uuid' })
                    }),
                    detail: {
                        tags: ["Barang"],
                        summary: "Delete Data Barang"
                    }
                })
        );
};