import { ApiResponseUtil } from "../../common/utils/response.util";
import { barangService } from "./barang.service";

export const barangHandler = {
    getAllBarangHandler: async ({ meta }: any) => {
        meta.log.info("HANDLER: barangHandler.getAllBarangHandler hit")
        const data = await barangService.getAllBarangService(meta)

        return ApiResponseUtil.success({
            message: "Get All Data Success",
            data
        })
    },
    getBarangByUuidHandler: async ({ params, meta }: any) => {
        meta.log.info("HANDLER: barangHandler.getBarangByUuidHandler hit")
        const data = await barangService.getBarangByUuidService(params.uuid, meta);

        return ApiResponseUtil.success({
            message: "Get Data Success",
            data
        })
    },
    createBarangHandler: async ({ body, meta, set }: any) => {
        meta.log.info("HANDLER: barangHandler.createBarangHandler hit")
        const created = await barangService.createBarangService(body, meta)
        set.status = 201

        return ApiResponseUtil.success({
            message: "Create Data Success",
            data: created
        })
    },
    updateBarangHandler: async ({ params, body, meta, set }: any) => {
        meta.log.info("HANDLER: barangHandler.updateBarangHandler hit")
        const updated = await barangService.updateBarangService(params.uuid, body, meta)
        set.status = 200

        return ApiResponseUtil.success({
            message: "Update Data Success",
            data: updated
        })
    },
    deleteBarangHandler: async ({ params, meta, set }: any) => {
        meta.log.info("HANDLER: barangHandler.deleteBarangHandler hit")
        await barangService.deleteBarangService(params.uuid, meta)
        set.status = 204
    }
}