import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.url().default("http://localhost:5173"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET saknas i miljövariablerna"),
  MONGO_URI: z.string().min(1, "MONGO_URI saknas i miljövariablerna"),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message).join(", ");

    throw new Error(`Ogiltig .env-konfiguration: ${messages}`);
  }

  return result.data;
};

// .env valideras en gång när appen startar. Efter det läser resten av appen typad config.
const env = parseEnv();

const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  authSecret: env.AUTH_SECRET,
  corsOrigin: env.CORS_ORIGIN,
};

export { config };
