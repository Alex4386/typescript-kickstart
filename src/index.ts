import { buildLogger } from './logger';

const isVerbose = process.argv.map((n) => n.toLowerCase()).includes('--verbose');

export const logger = buildLogger({
  level: isVerbose ? 'silly' : undefined,
});
