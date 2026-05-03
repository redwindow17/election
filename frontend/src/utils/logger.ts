// ============================================================
// Frontend Logger — Console wrapper that silences in production
// ============================================================

const isDev = import.meta.env.DEV;

const logger = {
  error(message: string, meta?: Record<string, unknown>): void {
    // Always log errors, even in production (without sensitive details)
    console.error(`[ERROR] ${message}`, meta ?? '');
  },
  warn(message: string, meta?: Record<string, unknown>): void {
    if (isDev) console.warn(`[WARN] ${message}`, meta ?? '');
  },
  info(message: string, meta?: Record<string, unknown>): void {
    if (isDev) console.info(`[INFO] ${message}`, meta ?? '');
  },
  debug(message: string, meta?: Record<string, unknown>): void {
    if (isDev) console.debug(`[DEBUG] ${message}`, meta ?? '');
  },
};

export default logger;
