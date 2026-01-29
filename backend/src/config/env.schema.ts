import Joi from 'joi';

export const envSchema = Joi.object({
  APP_NAME: Joi.string().required(),

  APP_ENV: Joi.string()
    .valid('development', 'production', 'staging')
    .required(),

  APP_PORT: Joi.number().default(7000),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  MONGO_URI: Joi.string()
    .pattern(/^mongodb(\+srv)?:\/\//)
    .required(),

  MONGO_DB_NAME: Joi.string().required(),

  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
});
