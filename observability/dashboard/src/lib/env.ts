import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:8080"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3100"),
  NEXTAUTH_SECRET: z.string().min(1).default("dev-secret-change-me"),
  DATABASE_URL: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_RESEND_KEY: z.string().optional(),
  AUTH_EMAIL_FROM: z.string().optional(),
  JWT_SECRET: z.string().optional(),
});

export const env = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,
  AUTH_EMAIL_FROM: process.env.AUTH_EMAIL_FROM,
  JWT_SECRET: process.env.JWT_SECRET,
});
