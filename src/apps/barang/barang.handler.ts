import { barangService } from "./barang.service";

export const barangHandler = {
    getAllBarangHandler: async () => {
        const data = await barangService.getAllBarangService();
        return {
            success: true,
            data
        }
    },
}