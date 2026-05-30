import "dotenv/config";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  // Secrets och databas-URL ska saknas högt och tydligt, inte ge diffusa fel senare.
  if (!value) {
    throw new Error(`${name} saknas i miljövariablerna`);
  }

  return value;
};

const toPort = (value: string | undefined): number => {
  // PORT kommer från .env som text, men app.listen behöver ett nummer.
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port < 1) {
    throw new Error("PORT måste vara ett positivt heltal");
  }

  return port;
};

const config = {
  // Getters läser process.env när värdet används. Det gör tester enklare att styra.
  get nodeEnv() {
    return process.env.NODE_ENV ?? "development";
  },
  get port() {
    return toPort(process.env.PORT);
  },
  get mongoUri() {
    return requiredEnv("MONGO_URI");
  },
  get authSecret() {
    return requiredEnv("AUTH_SECRET");
  },
  get corsOrigin() {
    return process.env.CORS_ORIGIN ?? "http://localhost:5173";
  },
};

export { config };
