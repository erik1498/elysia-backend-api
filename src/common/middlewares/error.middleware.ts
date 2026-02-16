import { Elysia } from "elysia";
import { AppError } from "../errors/app.error";
import { ApiResponseUtil } from "../utils/response.util";
import { AppUtil } from "../utils/app.util";

/**
 * Global error handling middleware for the Elysia application.
 * This middleware intercepts all thrown errors, logs them based on the environment,
 * and transforms them into a standardized JSON response format.
 * * Features:
 * - Automated logging with stack traces (disabled in production).
 * - Handling of custom {@link AppError} instances.
 * - Transformation of Elysia 'VALIDATION' errors into a readable field-mapped format.
 * - Fallback for unhandled internal server errors.
 * * @param app - The Elysia application instance.
 */
export const errorMiddleware = (app: Elysia) =>
    app
        .onError(({ error, set, code, meta }: any) => {

            /**
             * 1. Log the error if it is not a routine validation error.
             * Stack traces are omitted in production to prevent sensitive data exposure.
             */
            if (code !== "VALIDATION") {
                meta.log.error({
                    code,
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error && AppUtil.checkProductionType() ? undefined : error.stack,
                    path: `HTTP ${meta.logMethod} ${meta.logPath}`
                }, "GLOBAL_ERROR_HANDLER");
            }
        
            /**
             * 2. Handle Custom Application Errors.
             * Automatically maps status codes and structured details from {@link AppError}.
             */
            if (error instanceof AppError) {
                set.status = error.statusCode;
                return ApiResponseUtil.error({
                    message: error.message,
                    code: error.code,
                    details: error.details
                })
            }

            /**
             * 3. Handle Elysia Schema Validation Errors.
             * Transforms complex AJV/TypeBox paths (e.g., "/items/0/name") 
             * into readable dot notation (e.g., "items[0].name").
             */
            if (code === 'VALIDATION') {
                set.status = 422;

                const formattedErrors = error.all.map((err: any) => {
                    const cleanField = err.path
                        .replace(/^\//, '') // Remove leading slash
                        .replace(/\/(\d+)/g, '[$1]') // Convert /0 to [0]
                        .replace(/\//g, '.'); // Convert / to .

                    return {
                        field: cleanField || 'root',
                        message: err.schema.error || err.message
                    };
                });

                return ApiResponseUtil.error({
                    code: "VALIDATION",
                    message: "Invalid Request",
                    details: formattedErrors
                })
            }

            /**
             * 4. Fallback for Unexpected Errors.
             * Prevents leaking raw system errors to the client.
             */
            set.status = 500;
            return ApiResponseUtil.error({
                code: "INTERNAL_SERVER_ERROR",
                message: "Internal Server Error"
            })
        });