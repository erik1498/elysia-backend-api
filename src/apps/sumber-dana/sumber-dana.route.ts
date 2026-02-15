import Elysia from "elysia"
import { createGenericRoute } from "../../common/utils/route-generator.util"
import { sumberDanaTable } from "./sumber-dana.model"
import { SumberDanaBodySchema, SumberDanaResponseSchema } from "./sumber-dana.schema"

export const sumberDanaRoute = (app: Elysia) => {
    return createGenericRoute(app, {
        entityName: "sumber_dana",
        filterKeys: ["nama"],
        model: sumberDanaTable,
        name: "sumberDana",
        prefix: "sumber-dana",
        roles: {
            deleteDataRoles: ["super_admin"],
            getAllDataRoles: ["super_admin"],
            getDataRoles: ["super_admin"],
            updateDataRoles: ["super_admin"]
        },
        schemas: {
            body: SumberDanaBodySchema,
            response: SumberDanaResponseSchema
        },
        searchKeys: ["nama"],
        sortKeys: ["nama"],
        tags: ["Sumber Dana"]
    })
}