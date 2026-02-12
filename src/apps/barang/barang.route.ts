import Elysia from "elysia";

export const barangRoute = (app: Elysia) => {
    return app.group("/barang", (group) =>
        group
            .get("/", async () => {
                return {
                    message: "GET Success",
                    success: true
                }
            })
    );
};