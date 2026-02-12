import { barangTable } from "./barang.model";
import { db } from "../../common/config/database/database.config";
import { eq, InferInsertModel } from "drizzle-orm";

export const barangRepository = {
    getAllBarangRepository: async () => {
        return await db.select().from(barangTable);
    },
    getBarangByUuidRepository: async (uuid: string) => {
        const [data] = await db.select().from(barangTable).where(eq(barangTable.uuid, uuid)).limit(1)
        return data
    },
    createBarangRepository: async (data: InferInsertModel<typeof barangTable>) => {
        const created = await db.insert(barangTable).values({
            ...data
        })
        return created
    },
    updateBarangRepository: async (uuid: string, data: InferInsertModel<typeof barangTable>) => {
        const updated = await db.update(barangTable).set({
            ...data
        }).where(eq(barangTable.uuid, uuid))
        return updated
    },
    deleteBarangRepository: async (uuid: string) => {
        const deleted = await db.delete(barangTable).where(eq(barangTable.uuid, uuid))
        return deleted
    },
}