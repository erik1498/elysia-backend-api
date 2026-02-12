import Elysia from "elysia";
import { barangHandler } from "./barang.handler";

export const barangRoute = (app: Elysia) => {
    return app.group("/barang", (group) =>
        group
            .get("/", barangHandler.getAllBarangHandler)
    );
};