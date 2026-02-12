import { BadRequestError, NotFoundError } from "../../common/errors/app.error";
import { RequestMeta } from "../../common/types/context";
import { barangRepository } from "./barang.repository";

export const barangService = {
    getAllBarangService: async (meta: RequestMeta) => {
        meta.log.info("SERVICE: barangService.getAllBarangService called")
        const data = await barangRepository.getAllBarangRepository()
        return data
    },
    getBarangByUuidService: async (uuid: string, meta: RequestMeta) => {
        meta.log.info(uuid, "SERVICE: barangService.getBarangByUuidService called")
        const data = await barangRepository.getBarangByUuidRepository(uuid)

        if (!data) {
            throw new NotFoundError
        }

        return data
    },
    createBarangService: async (data: any, meta: RequestMeta) => {
        meta.log.info(data, "SERVICE: barangService.createBarangService called")
        const uuid = crypto.randomUUID()
        data.uuid = uuid

        const created = await barangRepository.createBarangRepository(data)

        if (!created || created[0].affectedRows == 0) {
            throw new BadRequestError
        }

        return await barangRepository.getBarangByUuidRepository(uuid)
    },
    updateBarangService: async (uuid: string, data: any, meta: RequestMeta) => {
        meta.log.info({ uuid, data }, "SERVICE: barangService.updateBarangService called")
        const updated = await barangRepository.updateBarangRepository(uuid, data)

        if (!updated || updated[0].affectedRows == 0) {
            throw new NotFoundError
        }

        return await barangRepository.getBarangByUuidRepository(uuid)
    },
    deleteBarangService: async (uuid: string, meta: RequestMeta) => {
        meta.log.info({ uuid }, "SERVICE: barangService.deleteBarangService called")
        const deleted = await barangRepository.deleteBarangRepository(uuid)

        if (!deleted || deleted[0].affectedRows == 0) {
            throw new NotFoundError
        }
    }
}