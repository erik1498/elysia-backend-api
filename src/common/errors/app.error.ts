export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(404, message, "NOT_FOUND");
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Invalid request data") {
        super(400, message, "BAD_REQUEST");
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(401, message, "UNAUTHORIZED");
    }
}