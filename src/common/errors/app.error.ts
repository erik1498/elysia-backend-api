/**
 * Represents structured validation error details for specific fields.
 */
interface ValidationErrorDetail {
    /** The name of the field that failed validation */
    field: string;
    /** The human-readable reason why the validation failed */
    message: string;
}

/**
 * Base class for all application-specific errors.
 * Used to provide consistent error responses across the API.
 * * @example
 * throw new AppError(500, "Internal Server Error", "INTERNAL_ERROR");
 */
export class AppError extends Error {
    /**
     * @param statusCode - The HTTP status code (e.g., 400, 404, 500)
     * @param message - A descriptive error message
     * @param code - A unique string identifier for the error type
     * @param details - Optional array of field-level validation errors
     */
    constructor(
        public statusCode: number,
        public message: string,
        public code: string,
        public details?: ValidationErrorDetail[]
    ) {
        super(message);
        this.name = 'AppError';
        // Ensure stack trace is captured correctly in Node.js/Bun
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

/**
 * Thrown when a requested resource or record does not exist.
 * HTTP Status: 404 Not Found
 */
export class NotFoundError extends AppError {
    /** @param message - Custom error message (Defaults to "Not found") */
    constructor(message = "Not found") {
        super(404, message, "NOT_FOUND");
    }
}

/**
 * Thrown when the server cannot process the request due to client error.
 * HTTP Status: 400 Bad Request
 */
export class BadRequestError extends AppError {
    /** @param message - Custom error message (Defaults to "Invalid request data") */
    constructor(message = "Invalid request data") {
        super(400, message, "BAD_REQUEST");
    }
}

/**
 * Thrown when authentication is required and has failed or has not yet been provided.
 * HTTP Status: 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
    /** @param message - Custom error message (Defaults to "Unauthorized") */
    constructor(message = "Unauthorized") {
        super(401, message, "UNAUTHORIZED");
    }
}

/**
 * Thrown when the server understands the request but refuses to authorize it.
 * Used for insufficient RBAC permissions.
 * HTTP Status: 403 Forbidden
 */
export class ForbiddenError extends AppError {
    /** @param message - Custom error message (Defaults to "Forbidden: Access Denied") */
    constructor(message = "Forbidden: Access Denied") {
        super(403, message, "FORBIDDEN");
    }
}

/**
 * Thrown when the user has sent too many requests in a given amount of time.
 * HTTP Status: 429 Too Many Requests
 */
export class TooManyRequestError extends AppError {
    /** @param message - Custom error message (Defaults to "Too Many Request") */
    constructor(message = "Too Many Request") {
        super(429, message, "TOO_MANY_REQUEST");
    }
}

/**
 * Thrown when input validation fails (e.g., via Elysia or Zod schema).
 * HTTP Status: 422 Unprocessable Entity
 * * @example
 * throw new ValidationError([{ field: "email", message: "Invalid format" }]);
 */
export class ValidationError extends AppError {
    /**
     * @param details - Array of field-specific validation failures
     * @param message - Custom error message (Defaults to "Invalid Request")
     */
    constructor(
        details: ValidationErrorDetail[],
        message = "Invalid Request"
    ) {
        super(422, message, "VALIDATION", details);
        this.name = 'ValidationError';
    }
}