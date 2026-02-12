import DOMPurify from 'isomorphic-dompurify';

export const SecurityUtil = {
    sanitizeData: (data: any): any => {
        if (typeof data === 'string') {
            return DOMPurify.sanitize(data, {
                ALLOWED_TAGS: [],
                KEEP_CONTENT: true
            });
        }
        if (Array.isArray(data)) {
            return data.map(item => SecurityUtil.sanitizeData(item));
        }
        if (typeof data === 'object' && data !== null) {
            const cleanObj: any = {};
            for (const key in data) {
                cleanObj[key] = SecurityUtil.sanitizeData(data[key]);
            }
            return cleanObj;
        }
        return data;
    }
};