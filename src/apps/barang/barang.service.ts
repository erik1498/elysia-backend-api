import { BadRequestError, NotFoundError } from "../../common/errors/app.error";
import { barangRepository } from "./barang.repository";

export const barangService = {
    getAllBarangService: async () => {
        const data = await barangRepository.getAllBarangRepository()
        return data
    },
    getBarangByUuidService: async (uuid: string) => {
        const data = await barangRepository.getBarangByUuidRepository(uuid)

        if (!data) {
            throw new NotFoundError
        }

        return data
    },
    createBarangService: async (data: any) => {
        const uuid = crypto.randomUUID()
        data.uuid = uuid

        const created = await barangRepository.createBarangRepository(data)

        if (!created || created[0].affectedRows == 0) {
            throw new BadRequestError
        }

        return await barangRepository.getBarangByUuidRepository(uuid)
    },
    updateBarangService: async (uuid: string, data: any) => {
        const updated = await barangRepository.updateBarangRepository(uuid, data)

        if (!updated || updated[0].affectedRows == 0) {
            throw new NotFoundError
        }

        return await barangRepository.getBarangByUuidRepository(uuid)
    },
    deleteBarangService: async (uuid: string) => {
        const deleted = await barangRepository.deleteBarangRepository(uuid)

        if (!deleted || deleted[0].affectedRows == 0) {
            throw new NotFoundError
        }
    }
}