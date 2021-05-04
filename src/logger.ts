import { transports, format, createLogger, LoggerOptions } from 'winston';
import { TransformableInfo } from 'logform';
import WinstonDaily from 'winston-daily-rotate-file';
import chalk from 'chalk';

interface TransformableInfoWithBracketedLevel extends TransformableInfo {
  bracketedLevel: string;
}

export const metadataProcessor = {
  transform: (log: TransformableInfo) => {
    const { level, message, timestamp, ...metadata } = log;

    log.metadata = metadata;
    return log;
  },
};

export const coloredBrackets = {
  transform: (log: TransformableInfo) => {
    const symbols = Object.getOwnPropertySymbols(log);
    const levelSymbol = symbols.filter((n) => n.toString() === 'Symbol(level)')[0] as any;

    if (levelSymbol) {
      const rawLevel = log[levelSymbol];
      (log as TransformableInfoWithBracketedLevel).bracketedLevel = log.level.replace(rawLevel, '[' + rawLevel + ']');
    }

    return log;
  },
};

export const logFormatter = format.printf((_log) => {
  const log = _log as TransformableInfoWithBracketedLevel;
  const metadata = log.metadata && Object.keys(log.metadata).length > 0 ? log.metadata : {};

  return `${chalk.yellowBright(`[${log.timestamp}]`)} ${log.bracketedLevel} ${log.message} ${JSON.stringify(metadata)}`;
});

const WinstonDailyConfig = {
  level: 'info',
  datePattern: 'YYYY-MM-DD',
  dirname: 'logs',
  filename: '%DATE%.log',
  maxFiles: 30,
  zippedArchive: true,
};

export function buildLogger(loggerOptions: LoggerOptions = {}) {
  // create a logger
  const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    // defaultMeta: { service: 'your-service-name' },
    ...loggerOptions,
    transports: [
      //
      // - Write to all logs with level `info` and below to `quick-start-combined.log`.
      // - Write all logs error (and below) to `quick-start-error.log`.
      //
      new WinstonDaily({
        ...WinstonDailyConfig,
        level: 'error',
        filename: '%DATE%.error.log',
      }),
      new WinstonDaily({
        ...WinstonDailyConfig,
        level: 'verbose',
        filename: '%DATE%.verbose.log',
      }),
      new WinstonDaily({
        ...WinstonDailyConfig,
        level: 'info',
        filename: '%DATE%.log',
      }),
      new transports.Console({
        format: format.combine(metadataProcessor, format.colorize(), coloredBrackets, logFormatter),
      }),
    ],
  });

  return logger;
}
