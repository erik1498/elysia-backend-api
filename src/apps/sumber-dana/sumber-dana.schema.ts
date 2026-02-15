import { t } from "elysia";

export const SumberDanaBodySchema = t.Object({
    nama: t.String({
        maxLength: 255,
        minLength: 1,
        examples: ["SumberDana"]
    }),
})

export const SumberDanaResponseSchema = t.Object({
    uuid: t.String({ format: 'uuid' }),
    nama: t.String(),
});