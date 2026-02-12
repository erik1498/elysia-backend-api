import Elysia from "elysia";
import { barangRoute } from "../apps/barang/barang.route";

export const apiRoutes = (app: Elysia) =>
    app.group("/api", (group) =>
        group
            .use(barangRoute)
    );