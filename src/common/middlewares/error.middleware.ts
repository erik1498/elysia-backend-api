import { Elysia } from "elysia";
import { AppError } from "../errors/app.error";
import { ApiResponseUtil } from "../utils/response.util";
import { AppUtil } from "../utils/app.util";

export const errorMiddleware = (app: Elysia) =>
    app
        .onError(({ error, set, code, meta }: any) => {

            if (code !== "VALIDATION") {
                meta.log.error({
                    code,
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error && AppUtil.checkProductionType() ? undefined : error.stack,
                    path: `HTTP ${meta.logMethod} ${meta.logPath}`
                }, "GLOBAL_ERROR_HANDLER");
            }
        
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