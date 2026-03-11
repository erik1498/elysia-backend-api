import { t } from "elysia";

export const UserLoginBodySchema = t.Object({
    username: t.String({
        maxLength: 50,
        minLength: 1,
        examples: ["username"]
    }),
    password: t.String({
        maxLength: 50,
        minLength: 1,
        examples: ["password"]
    })
})

export const UserRegisterBodySchema = t.Object({
    nama: t.String({
        maxLength: 50,
        minLength: 1,
        examples: ["nama"]
    }),
    username: t.String({
        maxLength: 50,
        minLength: 1,
        examples: ["username"]
    }),
    password: t.String({
        maxLength: 50,
        minLength: 1,
        examples: ["password"]
    })
})

export const UserLoginResponseSchema = t.Object({
    accessToken: t.String()
})

export const UserInfoResponseSchema = t.Object({
    nama: t.String(),
    username: t.String()
})