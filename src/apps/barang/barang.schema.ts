import { t } from "elysia";

export const BarangBodySchema = t.Object({
    nama: t.String({
        maxLength: 255,
        minLength: 1,
        examples: ["Barang"]
    }),
    harga: t.Number({
        minimum: 1,
        examples: [1000]
    }),
    detail: t.String({
        maxLength: 255,
        minLength: 1,
        examples: ["Barang Detail"]
    })
})

export const BarangResponseSchema = t.Object({
    uuid: t.String({ format: 'uuid' }),
    nama: t.String(),
    harga: t.Numeric(),
    detail: t.String(),
});