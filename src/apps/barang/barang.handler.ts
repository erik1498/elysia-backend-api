import { ApiResponseUtil } from "../../common/utils/response.util";
import { barangService } from "./barang.service";

export const barangHandler = {
    getAllBarangHandler: async () => {
        const data = await barangService.getAllBarangService()
        return ApiResponseUtil.success({
            data,
            message: "Get All Data Success"
        })
    },
    getBarangByUuidHandler: async ({ params }: any) => {
        const data = await barangService.getBarangByUuidService(params.uuid)
        return ApiResponseUtil.success({
            data,
            message: "Get Data Success"
        })
    },
    createBarangHandler: async ({ body, set }: any) => {
        const created = await barangService.createBarangService(body)
        set.status = 201
        return ApiResponseUtil.success({
            data: created,
            message: "Create Data Success"
        })
    },
    updateBarangHandler: async ({ body, params, set }: any) => {
        const updated = await barangService.updateBarangService(params.uuid, body)
        return ApiResponseUtil.success({
            data: updated,
            message: "Update Data Success"
        })
    },
    deleteBarangHandler: async ({ params, set }: any) => {
        await barangService.deleteBarangService(params.uuid)
        set.status = 204
    }
}