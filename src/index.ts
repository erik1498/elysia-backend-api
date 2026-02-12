import Elysia from "elysia";
import { apiRoutes } from "./routes";

const app = new Elysia()
    .use(apiRoutes)
    .listen(3000, (server) => {
        console.log(`APPLICATION : Running on http://${server.hostname}:${server.port}`)
    })