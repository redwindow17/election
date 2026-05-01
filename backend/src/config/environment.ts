// ============================================================
// Environment Configuration — Zod-validated at startup
// ============================================================

import { z } from 'zod';

const optionalGoogleValue = z
  .string()
  .optional()
  .transform((value) => {
    if (!value || value === '...' || value.startsWith('your-')) return undefined;
    return value;
  });

const booleanFlag = (defaultValue: boolean) =>
  z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) return defaultValue;
      return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
    });

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Google Cloud / Vertex AI
  GOOGLE_CLOUD_PROJECT: optionalGoogleValue,
  GOOGLE_APPLICATION_CREDENTIALS: optionalGoogleValue,
  VERTEX_AI_LOCATION: z.string().default('us-central1'),
  VERTEX_AI_MODEL: z.string().default('gemini-1.5-pro'),

  // Firebase
  FIREBASE_PROJECT_ID: optionalGoogleValue,
  FIREBASE_APPCHECK_REQUIRED: booleanFlag(false),
  DEMO_AUTH_ENABLED: booleanFlag(process.env.NODE_ENV !== 'production'),

  // Cloud Storage exports
  GCS_EXPORT_BUCKET: optionalGoogleValue,
  GCS_SIGNED_URL_TTL_MINUTES: z.string().default('15').transform(Number),

  // BigQuery analytics
  BIGQUERY_DATASET: optionalGoogleValue,
  BIGQUERY_EVENTS_TABLE: optionalGoogleValue.default('election_events'),
  BIGQUERY_ROLLUPS_TABLE: optionalGoogleValue.default('daily_rollups'),
  ANALYTICS_SALT: z.string().default('demo-analytics-salt'),

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

export function hasGoogleProject(config = getConfig()): boolean {
  return Boolean(config.GOOGLE_CLOUD_PROJECT || config.FIREBASE_PROJECT_ID);
}
