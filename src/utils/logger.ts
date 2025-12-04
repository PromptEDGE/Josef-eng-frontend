const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) logger.debug('[DEBUG]', ...args);
  },

  info: (...args: any[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },

  warn: (...args: any[]) => {
    logger.warn('[WARN]', ...args);
  },

  error: (message: string, error?: unknown) => {
    if (!isDev) {
      // TODO: Send to monitoring service (Sentry, DataDog, etc.)
      // window.errorReporter?.captureException(error, { extra: { message } });
    }
    logger.error('[ERROR]', message, error);
  },
};
