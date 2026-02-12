import { barangHandler } from "./barang.handler";
import Elysia from "elysia";
import { BarangBodySchema } from "./barang.schema";

export const barangRoute = (app: Elysia) => {
    return app.group("/barang", (group) =>
        group
            .get("/", barangHandler.getAllBarangHandler)
            .get("/:uuid", barangHandler.getBarangByUuidHandler)
            .post("/", barangHandler.createBarangHandler, {
                body: BarangBodySchema
            })
            .put("/:uuid", barangHandler.updateBarangHandler, {
                body: BarangBodySchema
            })
            .delete("/:uuid", barangHandler.deleteBarangHandler)
    );
};