/**
 * A collection of general-purpose utility functions for the application.
 */
export const AppUtil = {
    /**
     * Determines if the application is currently running in a production environment.
     * This check is typically used to toggle features such as:
     * - Disabling detailed error stack traces in API responses.
     * - Enabling stricter CORS and security policies.
     * - Adjusting log verbosity.
     * * @returns {boolean} True if NODE_ENV is set to 'production', otherwise false.
     * * @example
     * if (AppUtil.checkProductionType()) {
     * console.log("Running in Production Mode");
     * }
     */
    checkProductionType: (): boolean => {
        return Bun.env.NODE_ENV === 'production';
    }
}