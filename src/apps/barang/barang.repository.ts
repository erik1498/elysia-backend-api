import { barangTable } from "./barang.model";
import { db } from "../../common/config/database/database.config";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { RequestMeta } from "../../common/interface/context";
import { auditLogTable } from "../audit/audit.model";

export const barangRepository = {
    getAllBarangRepository: async () => {
        return await db
            .select()
            .from(barangTable)
            .where(
                eq(barangTable.enabled, true)
            )
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
        const createdResult = await db.transaction(async (tx) => {
            const created = await tx
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
                    userAgent: meta.userAgent,
                    userUuid: meta.userUuid
                })

            return created
        })

        return createdResult
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
                    userAgent: meta.userAgent,
                    userUuid: meta.userUuid
                })

            return deleted
        })

        return deletedResult
    },
}
