import { t } from "elysia";

export const BaseResponseSchema = (data: any) => t.Object({
    success: t.Boolean(),
    message: t.String(),
    data: data
});