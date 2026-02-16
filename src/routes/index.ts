import Elysia from "elysia";
import { barangRoute } from "../apps/barang/barang.route";
import { userRoute } from "../apps/auth/user/user.route";
import { sumberDanaRoute } from "../apps/sumber-dana/sumber-dana.route";

export const apiRoutes = (app: Elysia) =>
    app.group("/api", (group) =>
        group
            .use(userRoute)
            .use(barangRoute)
            .use(sumberDanaRoute)
    );