export const ApiResponseUtil = {
    success: <T>({ data, message = "Request success" }: { data?: T, message?: string }) => ({
        success: true,
        message,
        data
    }),

    error: ({ message = "An error occurred", code, details }: { message?: string, code: string, details?: any }) => ({
        success: false,
        code,
        message,
        details
    })
};