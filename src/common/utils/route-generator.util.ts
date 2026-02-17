import Elysia, { Static, t } from "elysia";
import { RouteConfig, TableWithBase } from "../interface/route-generator.interface";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware";
import { jwtMiddleware } from "../middlewares/jwt.middleware";
import { paginationPlugin } from "../plugins/pagination.plugin";
import { rateLimiter } from "../middlewares/rate-limit.middleware";
import { RequestMeta } from "../../common/interface/context";
import { PaginationUtil } from "../../common/utils/pagination.util";
import { and, asc, desc, eq, like, or, SQL, sql } from "drizzle-orm";
import { ApiResponseUtil } from "./response.util";
import { PaginatedResponseSchema, PaginationQueryRequestSchema } from "../schemas/pagination.schema";
import { db } from "../config/database/database.config";
import { MySqlColumnBuilderBase, mysqlTable, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { cache } from "../config/storage/redis.config";
import { auditLogTable } from "../audit/audit.model";
import { BadRequestError, NotFoundError } from "../errors/app.error";
import { IdempotencyHeaderSchema } from "../schemas/idempotency.schema";
import { BaseResponseSchema } from "../schemas/response.schema";
import { BaseColumns, BaseColumnsType } from "../models/base.model";

export const createGenericModel = (tableName: string, tableColumn: Record<string, MySqlColumnBuilderBase>) => {
    return mysqlTable(tableName, {
        ...tableColumn,
        ...BaseColumns
    })
}

const modelRepository = {
    getAllRepository: async <T extends TableWithBase>(paginationObject: {
        page: number,
        size: number,
        search?: string,
        filter?: Record<string, string>,
        sort?: Record<string, string>,
    }, model: MySqlTableWithColumns<T>,
        searchAllowedColumn: string[]
    ) => {

        let filterConditions: SQL[] = [];
        let searchConditions: SQL[] = [];
        let orderSelectors: SQL[] = [];

        type ModelTable = typeof model.$inferSelect;
        type ModelColumnName = keyof ModelTable;

        if (paginationObject.search) {
            searchConditions = searchAllowedColumn.map((key) => {
                const column = model[key as ModelColumnName];
                return like(column, `%${paginationObject.search}%`);
            });
        }

        if (paginationObject.filter) {
            Object.entries(paginationObject.filter).forEach(([key, value]) => {
                if (key in model && value !== undefined && value !== null) {
                    const column = model[key as ModelColumnName];
                    filterConditions.push(eq(column as any, value));
                }
            })
        }

        if (paginationObject.sort) {
            Object.entries(paginationObject.sort).forEach(([key, direction]) => {
                const column = model[key as ModelColumnName];
                if (column) {
                    orderSelectors.push(
                        direction === 'desc' ? desc(column) : asc(column)
                    );
                }
            });
        }

        const data = await db
            .select()
            .from(model)
            .where(
                and(
                    or(...searchConditions)!,
                    ...filterConditions,
                    eq(model.enabled, true)
                )
            )
            .orderBy(...orderSelectors)
            .limit(paginationObject.size)
            .offset((paginationObject.page - 1) * paginationObject.size)

        const dataCount = await db
            .select({ total: sql<number>`count(*)` })
            .from(model)
            .where(
                and(
                    or(...searchConditions)!,
                    ...filterConditions,
                    eq(model.enabled, true)
                )
            )

        return {
            data,
            dataCount
        }
    },
    getByUuidRepository: async <T extends TableWithBase>(uuid: string, model: MySqlTableWithColumns<T>) => {
        const [data] = await db
            .select()
            .from(model)
            .where(
                and(
                    eq(model.uuid, uuid),
                    eq(model.enabled, true)
                )
            ).limit(1)
        return data
    },
    createRepository: async <T extends TableWithBase>(data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType, meta: RequestMeta, model: MySqlTableWithColumns<T>, entityName: string) => {

        const uuid = crypto.randomUUID()
        data.uuid = uuid
        data.idempotencyKey = meta.idempotencyKey

        await db.transaction(async (tx) => {
            await tx
                .insert(model)
                .values({
                    ...data,
                    createdBy: meta.userUuid
                })

            await tx
                .insert(auditLogTable)
                .values({
                    action: "CREATE",
                    entity: entityName,
                    entityUuid: data.uuid,
                    ipAddress: meta.ipAddress,
                    newData: data,
                    requestId: meta.requestId,
                    userAgent: meta.userAgent,
                    userUuid: meta.userUuid
                })
            return
        }).catch((err) => {
            if (err.cause.errno === 1062) {
                meta.log.error(`REPO: DUPLICATE ERROR (ER_DUP_ENTRY) idempotencyKey INSERT ON DB, idmp:${meta.idempotencyKey} IS NOT FOUND`)
            }
        })

        const [created] = await db
            .select()
            .from(model)
            .where(
                and(
                    eq(model.idempotencyKey, meta.idempotencyKey),
                )
            )

        return created
    },
    updateRepository: async <T extends TableWithBase>(uuid: string, data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType, meta: RequestMeta, model: MySqlTableWithColumns<T>, entityName: string) => {
        const updatedResult = await db.transaction(async (tx) => {

            const [oldData] = await tx
                .select()
                .from(model)
                .where(
                    and(
                        eq(model.uuid, uuid),
                        eq(model.enabled, true)
                    )
                ).limit(1)

            const updated = await tx
                .update(model)
                .set({
                    ...data,
                    updatedBy: meta.userUuid
                })
                .where(
                    and(
                        eq(model.uuid, uuid),
                        eq(model.enabled, true)
                    )
                )

            await tx
                .insert(auditLogTable)
                .values({
                    action: "UPDATE",
                    entity: entityName,
                    entityUuid: uuid,
                    ipAddress: meta.ipAddress,
                    newData: data,
                    oldData: oldData,
                    requestId: meta.requestId,
                    userAgent: meta.userAgent,
                    userUuid: meta.userUuid
                })

            return updated
        })

        return updatedResult
    },
    deleteRepository: async <T extends TableWithBase>(uuid: string, meta: RequestMeta, model: MySqlTableWithColumns<T>, entityName: string) => {

        const data = {
            enabled: false,
            updatedBy: meta.userUuid
        } as MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType

        const deletedResult = await db.transaction(async (tx) => {

            const [oldData] = await tx
                .select()
                .from(model)
                .where(
                    and(
                        eq(model.uuid, uuid),
                        eq(model.enabled, true)
                    )
                ).limit(1)

            const deleted = await tx
                .update(model)
                .set({ ...data })
                .where(
                    and(
                        eq(model.uuid, uuid),
                        eq(model.enabled, true)
                    )
                )

            await tx
                .insert(auditLogTable)
                .values({
                    action: "DELETE",
                    entity: entityName,
                    entityUuid: uuid,
                    ipAddress: meta.ipAddress,
                    newData: {
                        uuid,
                        enabled: false
                    },
                    oldData: oldData,
                    requestId: meta.requestId,
                    userAgent: meta.userAgent,
                    userUuid: meta.userUuid
                })

            return deleted
        })

        return deletedResult
    },
}

const modelService = {
    getAllService: async <T extends TableWithBase>(query: Static<typeof PaginationQueryRequestSchema>, meta: RequestMeta, model: MySqlTableWithColumns<T>, name: string, filterKeys: string[], sortKeys: string[], searchKeys: string[]) => {
        meta.log.info(query, `SERVICE: ${name}Service.getAllService called`)

        const paginationObject = PaginationUtil.convertQueryToObject(query)

        const data = await modelRepository.getAllRepository(paginationObject, model, searchKeys)

        const totalPages = Math.ceil(data.dataCount[0].total / paginationObject.size)

        return {
            data: data.data,
            meta: {
                page: paginationObject.page,
                size: paginationObject.size,
                totalItems: data.dataCount[0].total,
                totalPages,
                hasNext: paginationObject.page < totalPages,
                hasPrev: paginationObject.page > 1,
                filterAllowedKeys: filterKeys,
                sortAllowedKeys: sortKeys
            }
        }
    },
    getByUuidService: async  <T extends TableWithBase>(uuid: string, meta: RequestMeta, model: MySqlTableWithColumns<T>, name: string) => {
        meta.log.info({ uuid }, `SERVICE: ${name}Service.getBarangByUuidService called`)
        const data = await modelRepository.getByUuidRepository(uuid, model)

        if (!data) {
            throw new NotFoundError
        }

        return data
    },
    createService: async  <T extends TableWithBase>(data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType, meta: RequestMeta, model: MySqlTableWithColumns<T>, name: string, entityName: string) => {
        meta.log.info(data, `SERVICE: ${name}Service.createBarangService called`)
        const created = await modelRepository.createRepository(data, meta, model, entityName)

        if (!created) {
            throw new BadRequestError
        }

        return created
    },
    updateService: async  <T extends TableWithBase>(uuid: string, data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType, meta: RequestMeta, model: MySqlTableWithColumns<T>, name: string, entityName: string) => {
        meta.log.info({ uuid, data }, `SERVICE: ${name}Service.updateService called`)
        const updated = await modelRepository.updateRepository(uuid, data, meta, model, entityName)

        if (!updated || updated[0].affectedRows == 0) {
            throw new NotFoundError
        }

        return await modelRepository.getByUuidRepository(uuid, model)
    },
    deleteService: async  <T extends TableWithBase>(uuid: string, meta: RequestMeta, model: MySqlTableWithColumns<T>, name: string, entityName: string) => {
        meta.log.info({ uuid }, `SERVICE: ${name}Service.deleteBarangService called`)
        const deleted = await modelRepository.deleteRepository(uuid, meta, model, entityName)

        if (!deleted || deleted[0].affectedRows == 0) {
            throw new NotFoundError
        }
    }
}

/**
 * Automatically generates a standard CRUD route group for a given entity.
 * Includes built-in support for:
 * - Idempotency, JWT, and Rate Limiting.
 * - Role-based Access Control (RBAC).
 * - Automatic Logging and Audit Trail.
 * - Standardized API Responses.
 * * @template T - Table configuration that extends {@link TableWithBase}.
 * @param group - The Elysia group instance to attach routes to.
 * @param config - Configuration object of type {@link RouteConfig}.
 * @returns An Elysia group with GET, POST, PUT, and DELETE endpoints.
 */

export const createGenericRoute = <T extends TableWithBase>(group: Elysia<any, any, any, any, any, any>, config: RouteConfig<T>) => {
    return group
        .use(idempotencyMiddleware)
        .use(jwtMiddleware)
        .use(paginationPlugin)
        .use(rateLimiter(config.prefix, 60, 60))
        /**
         * [GET] Fetch all records with pagination, filtering, and sorting.
         */
        .get("/", async ({ query, meta }) => {
            meta.log.info(`HANDLER: ${config.name}Handler.getAllHandler hit`)

            const data = await modelService.getAllService(query, meta, config.model, config.name, config.filterKeys, config.sortKeys, config.searchKeys)

            return ApiResponseUtil.success({
                message: "Get All Data Success",
                data: data.data,
                meta: data.meta
            })
        }, {
            roles: config.roles.getAllDataRoles,
            query: PaginationQueryRequestSchema,
            paginationQueryValidate: {
                filterKeys: config.filterKeys,
                sortKeys: config.sortKeys
            },
            detail: {
                tags: config.tags,
                summary: `Get All Data ${config.name}`
            },
            response: {
                200: PaginatedResponseSchema(config.schemas.response)
            }
        })
        /**
         * [GET] Fetch a single record by its UUID.
         */
        .get("/:uuid", async ({ params, meta }: any) => {
            meta.log.info(`HANDLER: ${config.name}Handler.getByUuidHandler hit`)
            const data = await modelService.getByUuidService(params.uuid, meta, config.model, config.name);

            return ApiResponseUtil.success({
                message: "Get Data Success",
                data
            })
        }, {
            params: t.Object({
                uuid: t.String({ format: 'uuid' })
            }),
            detail: {
                tags: config.tags,
                summary: `Get Data ${config.name}`
            },
            response: {
                200: BaseResponseSchema(config.schemas.response)
            }
        })
        /**
         * [POST] Create a new record. Supports Idempotency check.
         */
        .post("/", async ({ request: { headers }, body, meta, set }) => {
            meta.log.info(`HANDLER: ${config.name}Handler.createHandler hit`)
            const created = await modelService.createService(body, meta, config.model, config.name, config.entityName)
            set.status = 201

            const response = ApiResponseUtil.success({
                message: "Create Data Success",
                data: created
            })

            const idmpKey = headers.get("x-idempotency-key")

            await cache.set(`idmp:${idmpKey}`, JSON.stringify(response), 'EX', 1800)

            return response
        }, {
            roles: config.roles.getDataRoles,
            body: config.schemas.body,
            headers: IdempotencyHeaderSchema,
            detail: {
                tags: config.tags,
                summary: `Create Data ${config.name}`
            },
            response: {
                201: BaseResponseSchema(config.schemas.response)
            }
        })
        /**
         * [PUT] Update an existing record by UUID.
         */
        .put("/:uuid", async ({ params, body, meta, set }: any) => {
            meta.log.info(`HANDLER: ${config.name}Handler.updateHandler hit`)
            const updated = await modelService.updateService(params.uuid, body, meta, config.model, config.name, config.entityName)
            set.status = 200

            return ApiResponseUtil.success({
                message: "Update Data Success",
                data: updated
            })
        }, {
            roles: config.roles.updateDataRoles,
            params: t.Object({
                uuid: t.String({ format: 'uuid' })
            }),
            body: config.schemas.body,
            detail: {
                tags: config.tags,
                summary: `Update Data ${config.name}`
            },
            response: {
                200: BaseResponseSchema(config.schemas.response)
            }
        })
        /**
         * [DELETE] Soft-delete a record by setting enabled to false.
         */
        .delete("/:uuid", async ({ params, meta, set }: any) => {
            meta.log.info(`HANDLER: ${config.name}Handler.deleteHandler hit`)
            await modelService.deleteService(params.uuid, meta, config.model, config.name, config.entityName)
            set.status = 204
        }, {
            roles: config.roles.deleteDataRoles,
            params: t.Object({
                uuid: t.String({ format: 'uuid' })
            }),
            detail: {
                tags: config.tags,
                summary: `Delete Data ${config.name} Barang`
            }
        })
};