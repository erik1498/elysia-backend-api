import { BadRequestError, NotFoundError } from "../../common/errors/app.error";
import { RequestMeta } from "../../common/interface/context";
import { PaginationUtil } from "../../common/utils/pagination.util";
import { barangRepository } from "./barang.repository";

export const barangService = {
    getAllBarangService: async (query: any, meta: RequestMeta) => {
        meta.log.info(query, "SERVICE: barangService.getAllBarangService called")

        const paginationObject = PaginationUtil.convertQueryToObject(query)

        const data = await barangRepository.getAllBarangRepository(paginationObject)

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
                filterAllowedKeys: ["harga"],
                sortAllowedKeys: ["harga", "nama"]
            }
        }
    },
    getBarangByUuidService: async (uuid: string, meta: RequestMeta) => {
        meta.log.info({ uuid }, "SERVICE: barangService.getBarangByUuidService called")
        const data = await barangRepository.getBarangByUuidRepository(uuid)

        if (!data) {
            throw new NotFoundError
        }

        return data
    },
    createBarangService: async (data: any, meta: RequestMeta) => {
        meta.log.info(data, "SERVICE: barangService.createBarangService called")
        const created = await barangRepository.createBarangRepository(data, meta)

        if (!created) {
            throw new BadRequestError
        }

        return created
    },
    updateBarangService: async (uuid: string, data: any, meta: RequestMeta) => {
        meta.log.info({ uuid, data }, "SERVICE: barangService.updateBarangService called")
        const updated = await barangRepository.updateBarangRepository(uuid, data, meta)

        if (!updated || updated[0].affectedRows == 0) {
            throw new NotFoundError
        }

        return await barangRepository.getBarangByUuidRepository(uuid)
    },
    deleteBarangService: async (uuid: string, meta: RequestMeta) => {
        meta.log.info({ uuid }, "SERVICE: barangService.deleteBarangService called")
        const deleted = await barangRepository.deleteBarangRepository(uuid, meta)

        if (!deleted || deleted[0].affectedRows == 0) {
            throw new NotFoundError
        }
    }
}