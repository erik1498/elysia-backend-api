/**
 * Utility for generating standardized API response objects.
 * This ensures that all endpoints return a consistent JSON structure,
 * making it easier for frontend clients to parse results and handle errors.
 */
export const ApiResponseUtil = {
    /**
     * Generates a standardized success response.
     * * @template T - The type of the data payload.
     * @template M - The type of the metadata (pagination, etc.).
     * * @param params - The response parameters.
     * @param params.data - The actual data payload to return.
     * @param params.message - A descriptive success message (Defaults to "Request success").
     * @param params.meta - Optional metadata, usually for paginated results.
     * * @returns A structured success object.
     */
    success: <T, M>({ data, message = "Request success", meta }: { data?: T, message?: string, meta?: M }) => ({
        success: true,
        message,
        data,
        meta
    }),

    /**
     * Generates a standardized error response.
     * * @param params - The error parameters.
     * @param params.message - A human-readable error description (Defaults to "An error occurred").
     * @param params.code - A unique machine-readable error code (e.g., "NOT_FOUND").
     * @param params.details - Optional field-level validation errors or debugging info.
     * * @returns A structured error object.
     */
    error: ({ message = "An error occurred", code, details }: { message?: string, code: string, details?: any }) => ({
        success: false,
        code,
        message,
        details
    })
};