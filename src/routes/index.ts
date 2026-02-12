import Elysia from "elysia";
import { barangRoute } from "../apps/barang/barang.route";
import { userRoute } from "../apps/auth/user/user.route";

export const apiRoutes = (app: Elysia) =>
    app.group("/api", (group) =>
        group
            .use(userRoute)
            .use(barangRoute)
    );