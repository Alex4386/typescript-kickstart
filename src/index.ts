import { buildLogger } from './logger';

const isVerbose = process.argv.map((n) => n.toLowerCase()).includes('--verbose');

export const logger = buildLogger({
  level: isVerbose ? 'silly' : undefined,
});

// example log data.
logger.silly('This is a silly message');
logger.verbose('Not Implemented.');
logger.debug('This is a debug message');
logger.info('This is a INFO');
logger.warn('This is a WARN');
logger.error('Not Implemented.', { assd: 'bummer', ang: 'gimotti' });
