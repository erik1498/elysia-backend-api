export const ApiResponseUtil = {
    success: <T, M>({ data, message = "Request success", meta }: { data?: T, message?: string, meta?: M }) => ({
        success: true,
        message,
        data,
        meta
    }),

    error: ({ message = "An error occurred", code, details }: { message?: string, code: string, details?: any }) => ({
        success: false,
        code,
        message,
        details
    })
};