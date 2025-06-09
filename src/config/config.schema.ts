import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Email
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  FROM_EMAIL: Joi.string().email().required(),
  FROM_NAME: Joi.string().default('SaaS App'),

  // Application
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  API_PREFIX: Joi.string().default('api/v1'),

  // Frontend
  FRONTEND_URL: Joi.string().uri().required(),

  // File Upload
  MAX_FILE_SIZE: Joi.number().default(5242880), // 5MB
  UPLOAD_DEST: Joi.string().default('./uploads'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
});