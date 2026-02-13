export interface RequestMeta {
    log: any;
    userAgent: string;
    userUuid: string;
    userRoles: string[];
    ipAddress: string;
    requestId: string;
    logPath: string;
    logMethod: string;
    startTime: number;
}