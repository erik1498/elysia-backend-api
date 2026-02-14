import { barangTable } from "./barang.model";
import { db } from "../../common/config/database/database.config";
import { and, asc, desc, eq, InferInsertModel, like, or, sql, SQL } from "drizzle-orm";
import { RequestMeta } from "../../common/interface/context";
import { auditLogTable } from "../audit/audit.model";

export const barangRepository = {
    getAllBarangRepository: async (paginationObject: any) => {
        let filterConditions: SQL[] = [];
        let searchConditions: SQL[] = [];
        let orderSelectors: SQL[] = [];

        const searchAllowedColumn = ["nama"];

        type Barang = typeof barangTable.$inferSelect;
        type BarangColumnName = keyof Barang;

        if (paginationObject.search) {
            searchConditions = searchAllowedColumn.map((key) => {
                const column = barangTable[key as BarangColumnName];
                return like(column, `%${paginationObject.search}%`);
            });
        }

        if (paginationObject.filter) {
            Object.entries(paginationObject.filter).forEach(([key, value]) => {
                if (key in barangTable && value !== undefined && value !== null) {
                    const column = barangTable[key as BarangColumnName];
                    filterConditions.push(eq(column as any, value));
                }
            })
        }

        if (paginationObject.sort) {
            Object.entries(paginationObject.sort).forEach(([key, direction]) => {
                const column = barangTable[key as BarangColumnName];
                if (column) {
                    orderSelectors.push(
                        direction === 'desc' ? desc(column) : asc(column)
                    );
                }
            });
        }

        const data = await db
            .select()
            .from(barangTable)
            .where(
                and(
                    or(...searchConditions)!,
                    ...filterConditions,
                    eq(barangTable.enabled, true)
                )
            )
            .orderBy(...orderSelectors)
            .limit(paginationObject.size)
            .offset((paginationObject.page - 1) * paginationObject.size)

        const dataCount = await db
            .select({ total: sql<number>`count(*)` })
            .from(barangTable)
            .where(
                and(
                    or(...searchConditions)!,
                    ...filterConditions,
                    eq(barangTable.enabled, true)
                )
            )
            .orderBy(...orderSelectors)
            .limit(paginationObject.size)
            .offset((paginationObject.page - 1) * paginationObject.size)

        return {
            data,
            dataCount
        }
    },
    getBarangByUuidRepository: async (uuid: string) => {
        const [data] = await db
            .select()
            .from(barangTable)
            .where(
                and(
                    eq(barangTable.uuid, uuid),
                    eq(barangTable.enabled, true)
                )
            ).limit(1)
        return data
    },
    createBarangRepository: async (data: InferInsertModel<typeof barangTable>, meta: RequestMeta) => {

        const uuid = crypto.randomUUID()
        data.uuid = uuid
        data.idempotencyKey = meta.idempotencyKey

        await db.transaction(async (tx) => {
            await tx
                .insert(barangTable)
                .values({
                    ...data,
                    createdBy: meta.userUuid
                })

            await tx
                .insert(auditLogTable)
                .values({
                    action: "CREATE",
                    entity: "barang",
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
            .from(barangTable)
            .where(
                and(
                    eq(barangTable.idempotencyKey, meta.idempotencyKey),
                )
            )

        return created
    },
    updateBarangRepository: async (uuid: string, data: InferInsertModel<typeof barangTable>, meta: RequestMeta) => {
        const updatedResult = await db.transaction(async (tx) => {

            const [oldData] = await tx
                .select()
                .from(barangTable)
                .where(
                    and(
                        eq(barangTable.uuid, uuid),
                        eq(barangTable.enabled, true)
                    )
                ).limit(1)

            const updated = await tx
                .update(barangTable)
                .set({
                    ...data,
                    updatedBy: meta.userUuid
                })
                .where(
                    and(
                        eq(barangTable.uuid, uuid),
                        eq(barangTable.enabled, true)
                    )
                )

            await tx
                .insert(auditLogTable)
                .values({
                    action: "UPDATE",
                    entity: "barang",
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
    deleteBarangRepository: async (uuid: string, meta: RequestMeta) => {

        const deletedResult = await db.transaction(async (tx) => {

            const [oldData] = await tx
                .select()
                .from(barangTable)
                .where(
                    and(
                        eq(barangTable.uuid, uuid),
                        eq(barangTable.enabled, true)
                    )
                ).limit(1)

            const deleted = await tx
                .update(barangTable)
                .set({
                    enabled: false,
                    updatedBy: meta.userUuid
                })
                .where(
                    and(
                        eq(barangTable.uuid, uuid),
                        eq(barangTable.enabled, true)
                    )
                )

            await tx
                .insert(auditLogTable)
                .values({
                    action: "DELETE",
                    entity: "barang",
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
