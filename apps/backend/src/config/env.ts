import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  TRANSPORT_CACHE_TTL_MS: z.coerce.number().default(300_000),
  CITYLINE_EXTERNAL_API_URL: z.string().url().optional().or(z.literal('')).transform((value) => value || undefined),
  OPENROUTESERVICE_API_KEY: z.string().min(1).optional().or(z.literal('')).transform((value) => value || undefined),
  OPENROUTESERVICE_BASE_URL: z.string().url().default('https://api.openrouteservice.org'),
  OPENROUTESERVICE_PROFILE: z.string().min(1).default('driving-car'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_SECRET: z.string().min(16).default('cityline-dev-secret-change-me'),
  BREVO_API_KEY: z.string().min(1).optional().or(z.literal('')).transform((value) => value || undefined),
  EMAIL_FROM: z.string().min(3).optional().or(z.literal('')).transform((value) => value || undefined),
  BREVO_SENDER_NAME: z.string().min(1).optional().or(z.literal('')).transform((value) => value || undefined),
  APP_URL: z.string().url().default('http://localhost:3000'),
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  TRANSPORT_CACHE_TTL_MS: process.env.TRANSPORT_CACHE_TTL_MS,
  CITYLINE_EXTERNAL_API_URL: process.env.CITYLINE_EXTERNAL_API_URL,
  OPENROUTESERVICE_API_KEY: process.env.OPENROUTESERVICE_API_KEY,
  OPENROUTESERVICE_BASE_URL: process.env.OPENROUTESERVICE_BASE_URL,
  OPENROUTESERVICE_PROFILE: process.env.OPENROUTESERVICE_PROFILE,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM ?? process.env.BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME,
  APP_URL: process.env.APP_URL,
});
