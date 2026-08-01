import { env } from "@config/env";

const parseOrigins = (origins: string) =>
  origins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const parseClusterNodes = (nodes?: string) =>
  nodes?.split(",").map((node) => {
    const [host, port] = node.trim().split(":");

    return {
      host,
      port: Number(port),
    };
  }) ?? [];

export const config = {
  server: {
    name: env.APP_NAME,
    url: env.APP_URL,
    env: env.NODE_ENV,
    port: env.PORT,

    api: {
      prefix: env.API_PREFIX,
      version: env.API_VERSION,
    },

    trustProxy: env.TRUST_PROXY,
  },

  database: {
    mongoUri: env.MONGO_URI,
  },

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    username: env.REDIS_USERNAME,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    url: env.REDIS_URL,
    keyPrefix: env.REDIS_KEY_PREFIX,
    clusterNodes: parseClusterNodes(env.REDIS_CLUSTER_NODES),
  },

  security: {
    corsOrigins: parseOrigins(env.CORS_ORIGIN),

    bcrypt: {
      saltRounds: env.BCRYPT_SALT_ROUNDS,
    },

    cookie: {
      secret: env.COOKIE_SECRET,
    },
  },

  jwt: {
    access: {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_EXPIRES,
    },

    refresh: {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_EXPIRES,
    },
  },

  rateLimit: {
    global: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    },

    login: {
      windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
      max: env.LOGIN_RATE_LIMIT_MAX,
    },
  },

  logger: {
    serviceName: env.SERVICE_NAME,
    level: env.LOG_LEVEL,
    pretty: env.LOG_PRETTY,

    slowApiThreshold: env.SLOW_API_THRESHOLD_MS,
    slowQueryThreshold: env.SLOW_QUERY_THRESHOLD_MS,
    slowJobThreshold: env.SLOW_JOB_THRESHOLD_MS,
  },

  swagger: {
    enabled: env.SWAGGER_ENABLED,
  },

  mail: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,

    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },

    from: env.SMTP_FROM,
  },

  queue: {
    prefix: env.QUEUE_PREFIX,
  },

  upload: {
    path: env.UPLOAD_PATH,
    maxFileSize: env.MAX_FILE_SIZE,
  },

  monitoring: {
    enabled: env.METRICS_ENABLED,
  },

  seed: {
    admin: {
      name: env.DEFAULT_ADMIN_NAME,
      email: env.DEFAULT_ADMIN_EMAIL,
      password: env.DEFAULT_ADMIN_PASSWORD,
    },
  },
} as const;

export type Config = typeof config;
