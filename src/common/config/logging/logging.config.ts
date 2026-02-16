import pino from 'pino';
import { AppUtil } from '../../utils/app.util';

/**
 * Configuration for the application's logging transport system.
 * It utilizes a multi-target approach to satisfy both development and production needs.
 */
const transport = pino.transport({
    targets: [
        /**
         * Target 1: Console Logging (Development Optimized)
         * Uses 'pino-pretty' to format JSON logs into human-readable, colorized output.
         * Level: 'debug' to capture detailed system events during development.
         */
        {
            target: 'pino-pretty',
            level: 'debug',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.mm',
            }
        },
        /**
         * Target 2: File Logging with Rotation (Production Optimized)
         * Uses 'pino-roll' to manage log persistence on the VPS.
         * Level: 'info' to keep file sizes manageable while capturing critical events.
         */
        {
            target: 'pino-roll',
            level: 'info',
            options: {
                file: './logs/app/app',
                extension: '.log',
                frequency: 'daily', // Rotate logs every day
                mkdir: true,
                dateFormat: 'yyyy-MM-dd',
                size: '20m', // Rotate if file exceeds 20 Megabytes
                limit: {
                    count: 90 // Retain logs for 90 days (3 months history)
                }
            }
        }
    ]
});

/**
 * The Central Logger instance for the application.
 * Configured with dynamic severity levels, ISO timestamps, and security redaction.
 */
export const appLogger = pino(
    {
        /** * Dynamically sets log level:
         * - 'info' in Production (balances performance and visibility).
         * - 'debug' in Development (maximum visibility).
         */
        level: AppUtil.checkProductionType() ? 'info' : 'debug',
        
        timestamp: pino.stdTimeFunctions.isoTime,

        /**
         * Security Redaction:
         * Automatically hides sensitive fields to prevent them from leaking into logs.
         * Applies to root 'password' and nested properties.
         */
        redact: {
            paths: [
                'password', 
                'data.password', 
                '*.password'
            ],
            censor: '[REDACTED]'
        },
    },
    transport
);