import Elysia, { Static, t } from "elysia";
import { CreatedDataTransactionFunction, DeletedDataTransactionFunction, RelationConfig, RouteConfig, TableWithBase, UpdatedDataTransactionFunction } from "../interface/route-generator.interface";
import { paginationPlugin } from "../plugins/pagination.plugin";
import { RequestMeta } from "../interface/context";
import { PaginationUtil } from "./pagination.util";
import { aliasedTable, and, asc, desc, eq, inArray, like, or, SQL, sql } from "drizzle-orm";
import { ApiResponseUtil } from "./response.util";
import { PaginatedResponseSchema, PaginationQueryRequestSchema } from "../schemas/pagination.schema";
import { db } from "../config/database/database.config";
import { MySqlColumnBuilderBase, mysqlTable, MySqlTableExtraConfigValue, MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { auditLogTable } from "../audit/audit.model";
import { BadRequestError, NotFoundError, SQLError } from "../errors/app.error";
import { IdempotencyHeaderSchema } from "../schemas/idempotency.schema";
import { BaseResponseSchema } from "../schemas/response.schema";
import { BaseColumns, BaseColumnsType } from "../models/base.model";

export const createGenericModel = <
    TTableName extends string,
    TColumns extends Record<string, MySqlColumnBuilderBase>
>(
    tableName: TTableName,
    tableColumn: TColumns,
    relations?: (self: any) => MySqlTableExtraConfigValue[]
) => {
    const dynamicBaseColumns = {
        ...BaseColumns,
        idempotencyKey: BaseColumns.idempotencyKey.unique(`${tableName}_idmp`)
    };

    const allColumn = {
        ...tableColumn,
        ...dynamicBaseColumns
    };

    return mysqlTable(tableName, allColumn, (table) => {
        if (relations) {
            return relations(table);
        }
        return [];
    });
}

const getEffectiveTable = (rel: RelationConfig) => {
    return rel.aliasedName
        ? aliasedTable(rel.relationTable, rel.aliasedName)
        : rel.relationTable;
};

const modelRepository = {
    getAllRepository: async <T extends TableWithBase>(
        paginationObject: {
            page: number,
            size: number | string,
            search?: string,
            filter?: Record<string, string | string[]>,
            sort?: Record<string, string | string[]>,
        },
        model: MySqlTableWithColumns<T>,
        searchAllowedColumn: string[],
        relationConfigs?: RelationConfig[]
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

                    if (Array.isArray(value)) {
                        filterConditions.push(inArray(column as any, value));
                    } else {
                        filterConditions.push(eq(column as any, value));
                    }
                }
            });
        }

        if (paginationObject.sort) {
            Object.entries(paginationObject.sort).forEach(([key, direction]) => {
                const column = model[key as ModelColumnName];
                if (column) {
                    const dir = Array.isArray(direction) ? direction[0] : direction;
                    const isDesc = dir?.toLowerCase() === 'desc';
                    orderSelectors.push(isDesc ? desc(column) : asc(column));
                }
            });
        }

        let querySelect: any = { ...model };

        if (relationConfigs) {
            relationConfigs.forEach((rel) => {
                const tableToUse = getEffectiveTable(rel)
                rel.relationData.forEach((data) => {
                    querySelect[data.aliasName] = tableToUse[data.columnOnRelationTableName];
                });
            });
        }

        const baseQuery = db.select(querySelect).from(model);

        if (relationConfigs) {
            relationConfigs.forEach((rel) => {
                const tableToUse = getEffectiveTable(rel)
                baseQuery.leftJoin(
                    tableToUse,
                    eq(model[rel.columnOnTableName as ModelColumnName], tableToUse.uuid)
                );
            });
        }

        const finalQuery = baseQuery
            .where(
                and(
                    searchConditions.length > 0 ? or(...searchConditions) : undefined,
                    ...filterConditions,
                    eq(model.enabled, true)
                )
            )
            .orderBy(...orderSelectors);

        if (paginationObject.size !== "all") {
            const limit = Number(paginationObject.size);
            const offset = (Number(paginationObject.page) - 1) * limit;

            finalQuery.limit(limit).offset(offset);
        }

        const data = await finalQuery;

        const countQuery = db.select({ total: sql<number>`count(*)` }).from(model);

        if (relationConfigs) {
            relationConfigs.forEach((rel) => {
                const tableToUse = getEffectiveTable(rel)
                countQuery.leftJoin(
                    tableToUse,
                    eq(model[rel.columnOnTableName as ModelColumnName], tableToUse.uuid)
                );
            });
        }

        const dataCount = await countQuery
            .where(
                and(
                    searchConditions.length > 0 ? or(...searchConditions) : undefined,
                    ...filterConditions,
                    eq(model.enabled, true)
                )
            );

        return {
            data,
            totalItems: Number(dataCount[0]?.total || 0)
        };
    },
    getByUuidRepository: async <T extends TableWithBase>(uuid: string, model: MySqlTableWithColumns<T>, relationConfigs?: RelationConfig[]) => {
        type ModelTable = typeof model.$inferSelect;
        type ModelColumnName = keyof ModelTable;

        let querySelect: any = { ...model };

        if (relationConfigs) {
            relationConfigs.forEach((rel) => {
                const tableToUse = getEffectiveTable(rel)
                rel.relationData.forEach((data) => {
                    querySelect[data.aliasName] = tableToUse[data.columnOnRelationTableName];
                });
            });
        }

        const baseQuery = db
            .select(querySelect)
            .from(model);

        if (relationConfigs) {
            relationConfigs.forEach((rel) => {
                const tableToUse = getEffectiveTable(rel)
                baseQuery.leftJoin(
                    tableToUse,
                    eq(model[rel.columnOnTableName as ModelColumnName], tableToUse.uuid)
                );
            });
        }

        const [data] = await baseQuery
            .where(
                and(
                    eq(model.uuid, uuid),
                    eq(model.enabled, true)
                )
            ).limit(1)

        return data
    },
    createRepository: async <T extends TableWithBase>(
        data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType,
        meta: RequestMeta,
        model: MySqlTableWithColumns<T>,
        createDataTransaction: CreatedDataTransactionFunction | undefined,
        entityName: string
    ) => {

        const uuid = crypto.randomUUID()
        data.uuid = uuid
        data.idempotencyKey = meta.idempotencyKey

        await db.transaction(async (tx) => {

            if (createDataTransaction?.beforeDataCreated) {
                await createDataTransaction.beforeDataCreated(tx, data, meta);
            }

            await tx
                .insert(model)
                .values({
                    ...data,
                    createdBy: meta.userUuid
                })

            if (createDataTransaction?.afterDataCreated) {
                await createDataTransaction.afterDataCreated(tx, data, meta);
            }

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
            throw new SQLError(err.message)
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
    updateRepository: async <T extends TableWithBase>(
        uuid: string,
        data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType,
        meta: RequestMeta,
        model: MySqlTableWithColumns<T>,
        updateDataTransaction: UpdatedDataTransactionFunction | undefined,
        entityName: string
    ) => {
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

            if (updateDataTransaction?.beforeDataUpdated) {
                await updateDataTransaction.beforeDataUpdated(tx, data, oldData, meta);
            }

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

            if (updateDataTransaction?.afterDataUpdated) {
                await updateDataTransaction.afterDataUpdated(tx, data, oldData, meta);
            }

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
    deleteRepository: async <T extends TableWithBase>(
        uuid: string, 
        meta: RequestMeta, 
        model: MySqlTableWithColumns<T>, 
        deleteDataTransaction: DeletedDataTransactionFunction | undefined,
        entityName: string
    ) => {

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

            if (deleteDataTransaction?.beforeDataDeleted) {
                await deleteDataTransaction.beforeDataDeleted(tx, data, oldData, meta);
            }

            const deleted = await tx
                .update(model)
                .set({ ...data })
                .where(
                    and(
                        eq(model.uuid, uuid),
                        eq(model.enabled, true)
                    )
                )

            if (deleteDataTransaction?.afterDataDeleted) {
                await deleteDataTransaction.afterDataDeleted(tx, data, oldData, meta);
            }

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
    getAllService: async <T extends TableWithBase>(query: Static<typeof PaginationQueryRequestSchema>, meta: RequestMeta, model: MySqlTableWithColumns<T>, name: string, filterKeys: string[], sortKeys: string[], searchKeys: string[], relationConfigs?: RelationConfig[]) => {
        meta.log.info(query, `SERVICE: ${name}Service.getAllService called`)

        const paginationObject = PaginationUtil.convertQueryToObject(query)

        const data = await modelRepository.getAllRepository(paginationObject, model, searchKeys, relationConfigs)

        let totalPages = 1;
        let hasNext = false;
        let hasPrev = false;

        if (paginationObject.size === "all") {
            totalPages = 1;
            hasNext = false;
            hasPrev = false;
        } else {
            const sizeNum = Number(paginationObject.size);
            totalPages = Math.ceil(data.totalItems / sizeNum);
            hasNext = paginationObject.page < totalPages;
            hasPrev = paginationObject.page > 1;
        }

        return {
            data: data.data,
            meta: {
                page: paginationObject.page,
                size: paginationObject.size,
                totalItems: data.totalItems,
                totalPages,
                hasNext,
                hasPrev,
                filterAllowedKeys: filterKeys,
                sortAllowedKeys: sortKeys
            }
        }
    },
    getByUuidService: async  <T extends TableWithBase>(uuid: string, meta: RequestMeta, model: MySqlTableWithColumns<T>, name: string, relationConfigs?: RelationConfig[]) => {
        meta.log.info({ uuid }, `SERVICE: ${name}Service.getBarangByUuidService called`)
        const data = await modelRepository.getByUuidRepository(uuid, model, relationConfigs)

        if (!data) {
            throw new NotFoundError
        }

        return data
    },
    createService: async  <T extends TableWithBase>(
        data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType,
        meta: RequestMeta,
        model: MySqlTableWithColumns<T>,
        name: string,
        createDataTransaction: CreatedDataTransactionFunction | undefined,
        entityName: string
    ) => {
        meta.log.info(data, `SERVICE: ${name}Service.createBarangService called`)
        const created = await modelRepository.createRepository(
            data,
            meta,
            model,
            createDataTransaction,
            entityName
        )

        if (!created) {
            throw new BadRequestError
        }

        return created
    },
    updateService: async  <T extends TableWithBase>(
        uuid: string,
        data: MySqlTableWithColumns<T>["$inferInsert"] & BaseColumnsType,
        meta: RequestMeta,
        model: MySqlTableWithColumns<T>,
        name: string,
        updateDataTransaction: UpdatedDataTransactionFunction | undefined,
        entityName: string
    ) => {
        meta.log.info({ uuid, data }, `SERVICE: ${name}Service.updateService called`)
        const updated = await modelRepository.updateRepository(
            uuid,
            data,
            meta,
            model,
            updateDataTransaction,
            entityName
        )

        if (!updated || updated[0].affectedRows == 0) {
            throw new NotFoundError
        }

        return await modelRepository.getByUuidRepository(uuid, model)
    },
    deleteService: async  <T extends TableWithBase>(
        uuid: string,
        meta: RequestMeta,
        model: MySqlTableWithColumns<T>,
        name: string,
        deleteDataTransaction: DeletedDataTransactionFunction | undefined,
        entityName: string
    ) => {
        meta.log.info({ uuid }, `SERVICE: ${name}Service.deleteBarangService called`)
        const deleted = await modelRepository.deleteRepository(
            uuid,
            meta,
            model,
            deleteDataTransaction,
            entityName
        )

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

    if (typeof Bun !== "undefined") {
        const { idempotencyMiddleware } = require("../middlewares/idempotency.middleware");
        const { jwtMiddleware } = require("../middlewares/jwt.middleware");
        const { rateLimiter } = require("../middlewares/rate-limit.middleware");

        group.use(idempotencyMiddleware);
        group.use(jwtMiddleware);
        group.use(rateLimiter(config.name, 60, 60));
    }

    /**
     * [GET] Fetch all records with pagination, filtering, and sorting.
     */
    group
        .use(paginationPlugin)
        .get("/", async ({ query, meta }) => {
            meta.log.info(`HANDLER: ${config.name}Handler.getAllHandler hit`)

            const data = await modelService.getAllService(query,
                meta,
                config.model,
                config.name,
                config.filterKeys,
                config.sortKeys,
                config.searchKeys,
                config.relationConfigs
            )

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
    group
        .get("/:uuid", async ({ params, meta }: any) => {
            meta.log.info(`HANDLER: ${config.name}Handler.getByUuidHandler hit`)
            const data = await modelService.getByUuidService(params.uuid, meta, config.model, config.name, config.relationConfigs);

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
    group
        .post("/", async ({ request: { headers }, body, meta, set }) => {
            meta.log.info(`HANDLER: ${config.name}Handler.createHandler hit`)
            const created = await modelService.createService(
                body,
                meta,
                config.model,
                config.name,
                config.functionInTransaction?.createData,
                config.entityName,
            )
            set.status = 201

            const response = ApiResponseUtil.success({
                message: "Create Data Success",
                data: created
            })

            if (typeof Bun !== "undefined") {
                const { cache } = require("../config/storage/redis.config");
                const idmpKey = headers.get("x-idempotency-key");
                if (idmpKey) {
                    await cache.set(`idmp:${idmpKey}`, JSON.stringify(response), 'EX', 1800);
                }
            }

            return response
        }, {
            beforeHandle: config.beforeHandle?.createData ?? undefined,
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
    group
        .put("/:uuid", async ({ params, body, meta, set }: any) => {
            meta.log.info(`HANDLER: ${config.name}Handler.updateHandler hit`)
            const updated = await modelService.updateService(
                params.uuid,
                body,
                meta,
                config.model,
                config.name,
                config.functionInTransaction?.updateData,
                config.entityName
            )
            set.status = 200

            return ApiResponseUtil.success({
                message: "Update Data Success",
                data: updated
            })
        }, {
            beforeHandle: config.beforeHandle?.updateData ?? undefined,
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
    group
        .delete("/:uuid", async ({ params, meta, set }: any) => {
            meta.log.info(`HANDLER: ${config.name}Handler.deleteHandler hit`)
            await modelService.deleteService(
                params.uuid,
                meta,
                config.model,
                config.name,
                config.functionInTransaction?.deleteData,
                config.entityName
            )
            set.status = 204
        }, {
            beforeHandle: config.beforeHandle?.deleteData ?? undefined,
            roles: config.roles.deleteDataRoles,
            params: t.Object({
                uuid: t.String({ format: 'uuid' })
            }),
            detail: {
                tags: config.tags,
                summary: `Delete Data ${config.name} Barang`
            }
        })

    return group
};