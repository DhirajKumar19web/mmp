import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  APP_NAME: z.string().default("ERP System"),
  APP_URL: z.url(),

  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  API_PREFIX: z.string().default("/api"),
  API_VERSION: z.string().default("v1"),

  TRUST_PROXY: z.union([z.boolean(), z.string()]).default("loopback, linklocal, uniquelocal"),
  // Database
  MONGO_URI: z.string().min(1),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_URL: z.string().optional(),
  REDIS_KEY_PREFIX: z.string().default("erp:"),

  REDIS_CLUSTER_NODES: z.string().optional(),

  // Security
  CORS_ORIGIN: z.string(),

  COOKIE_SECRET: z.string().min(32),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("30d"),

  // Rate Limit
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().default(5),

  // Logger
  SERVICE_NAME: z.string(),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  LOG_PRETTY: z.coerce.boolean().default(true),

  SLOW_API_THRESHOLD_MS: z.coerce.number().default(2000),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().default(100),
  SLOW_JOB_THRESHOLD_MS: z.coerce.number().default(5000),

  // Swagger
  SWAGGER_ENABLED: z.coerce.boolean().default(true),

  // SMTP
  SMTP_HOST: z.string(),

  SMTP_PORT: z.coerce.number(),

  SMTP_SECURE: z.coerce.boolean(),

  SMTP_USER: z.string(),

  SMTP_PASS: z.string(),

  SMTP_FROM: z.string(),

  // Queue
  QUEUE_PREFIX: z.string().default("erp"),

  // Upload
  UPLOAD_PATH: z.string().min(1).default("uploads"),

  MAX_FILE_SIZE: z.coerce.number().positive().default(5242880), // 5MB

  // Monitoring
  METRICS_ENABLED: z.coerce.boolean().default(true),

  // Seed
  DEFAULT_ADMIN_NAME: z.string(),

  DEFAULT_ADMIN_EMAIL: z.email(),

  DEFAULT_ADMIN_PASSWORD: z.string().min(8),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("\n❌ Invalid environment variables\n");

  console.table(
    result.error.issues.map((issue) => ({
      Variable: issue.path.join("."),
      Error: issue.message,
    }))
  );

  process.exit(1);
}

export const env = result.data;

export type Env = typeof env;
