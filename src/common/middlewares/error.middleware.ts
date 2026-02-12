import { Elysia } from "elysia";
import { AppError } from "../errors/app.error";
import { ApiResponseUtil } from "../utils/response.util";

export const errorMiddleware = (app: Elysia) =>
    app
        .onError(({ error, set, code }: any) => {

            if (error instanceof AppError) {
                set.status = error.statusCode;
                return ApiResponseUtil.error({
                    message: error.message,
                    code: error.code
                })
            }

            if (code === 'VALIDATION') {
                set.status = 422;

                const formattedErrors = error.all.map((err: any) => {
                    const cleanField = err.path
                        .replace(/^\//, '')
                        .replace(/\/(\d+)/g, '[$1]')
                        .replace(/\//g, '.');

                    return {
                        field: cleanField || 'root',
                        message: err.message
                    };
                });

                return ApiResponseUtil.error({
                    code: "VALIDATION",
                    message: "Invalid Request",
                    details: formattedErrors
                })
            }

            set.status = 500;
            return ApiResponseUtil.error({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal Server Error"
            })
        });