import pino from 'pino';
import { AppUtil } from '../../utils/app.util';

const transport = pino.transport({
    targets: [
        {
            target: 'pino-pretty',
            level: 'debug',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.mm',
            }
        },
        {
            target: 'pino-roll',
            level: 'info',
            options: {
                file: './logs/app/app',
                extension: '.log',
                frequency: 'daily',
                mkdir: true,
                dateFormat: 'yyyy-MM-dd',
                size: '20m',
                limit: {
                    count: 90
                }
            }
        }
    ]
});

export const appLogger = pino(
    {
        level: AppUtil.checkProductionType() ? 'info' : 'debug',
        timestamp: pino.stdTimeFunctions.isoTime,
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