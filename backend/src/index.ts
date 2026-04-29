// ============================================================
// Server Bootstrap — Load env, init Firebase, start server
// ============================================================

import dotenv from 'dotenv';
dotenv.config();

import { validateEnv, getConfig } from './config/environment';
import { initializeFirebaseAdmin } from './services/firebaseAdmin';
import { createApp } from './app';
import logger from './utils/logger';

async function main(): Promise<void> {
  try {
    // 1. Validate environment
    validateEnv();
    const config = getConfig();
    logger.info('Environment validated', { environment: config.NODE_ENV });

    // 2. Initialize Firebase Admin SDK
    initializeFirebaseAdmin();

    // 3. Create Express app
    const app = createApp();

    // 4. Start server
    app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`, {
        environment: config.NODE_ENV,
        port: config.PORT,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

main();
