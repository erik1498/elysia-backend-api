import DOMPurify from 'isomorphic-dompurify';

/**
 * Utility for handling security-related data transformations.
 * Primarily focuses on mitigating Cross-Site Scripting (XSS) by neutralizing 
 * potentially malicious HTML and script content within incoming data.
 */
export const SecurityUtil = {
    /**
     * Recursively sanitizes input data to remove HTML tags and scripts.
     * It traverses strings, arrays, and objects to ensure that all nested 
     * properties are cleaned before being processed by the application or stored in the database.
     * * @param data - The raw input data of any type (string, object, array, etc.).
     * @returns The sanitized version of the input, stripped of all HTML tags.
     * * @example
     * const unsafe = { bio: "<script>alert('xss')</script>Hello", tags: ["<b>Admin</b>"] };
     * const safe = SecurityUtil.sanitizeData(unsafe);
     * // Result: { bio: "Hello", tags: ["Admin"] }
     */
    sanitizeData: (data: any): any => {
        // Handle direct string input
        if (typeof data === 'string') {
            /**
             * DOMPurify configuration:
             * - ALLOWED_TAGS: [] -> Strips all HTML tags entirely.
             * - KEEP_CONTENT: true -> Retains the text inside the tags (e.g., "<b>Hi</b>" becomes "Hi").
             */
            return DOMPurify.sanitize(data, {
                ALLOWED_TAGS: [],
                KEEP_CONTENT: true
            });
        }

        // Handle arrays by recursively sanitizing each element
        if (Array.isArray(data)) {
            return data.map(item => SecurityUtil.sanitizeData(item));
        }

        // Handle objects by recursively sanitizing each property value
        if (typeof data === 'object' && data !== null) {
            const cleanObj: any = {};
            for (const key in data) {
                cleanObj[key] = SecurityUtil.sanitizeData(data[key]);
            }
            return cleanObj;
        }

        // Return primitives (numbers, booleans, null) as-is
        return data;
    }
};