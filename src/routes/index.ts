import Elysia from "elysia";

export const apiRoutes = (app: Elysia) =>
    app.group("/api", (group) =>
        group
            .get("", async () => {
                return {
                    message: "Success",
                    success: true
                }
            })
    );