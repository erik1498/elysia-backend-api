import { barangTable } from "./barang.model";
import { db } from "../../common/config/database/database.config";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { RequestMeta } from "../../common/interface/context";

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
        const created = await db
            .insert(barangTable)
            .values({
                ...data,
                createdBy: meta.userUuid
            })
        return created
    },
    updateBarangRepository: async (uuid: string, data: InferInsertModel<typeof barangTable>, meta: RequestMeta) => {
        const updated = await db
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
        return updated
    },
    deleteBarangRepository: async (uuid: string, meta: RequestMeta) => {
        const deleted = await db
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
        return deleted
    },
}