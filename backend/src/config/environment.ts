// ============================================================
// Environment Configuration — Zod-validated at startup
// ============================================================

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Google Cloud / Vertex AI
  GOOGLE_CLOUD_PROJECT: z.string().min(1, 'GOOGLE_CLOUD_PROJECT is required'),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('50').transform(Number),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedConfig: EnvConfig | null = null;

/**
 * Parse and validate all environment variables.
 * Throws a descriptive error if any required variable is missing or invalid.
 */
export function validateEnv(): EnvConfig {
  if (cachedConfig) return cachedConfig;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`❌ Environment validation failed:\n${formatted}`);
  }

  cachedConfig = result.data;
  return cachedConfig;
}

export function getConfig(): EnvConfig {
  if (!cachedConfig) {
    throw new Error('Config not initialized. Call validateEnv() first.');
  }
  return cachedConfig;
}
