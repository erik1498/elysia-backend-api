import { barangRepository } from "./barang.repository";

export const barangService = {
    getAllBarangService: async () => {
        const data = await barangRepository.getAllBarangRepository();
        return data
    },
}