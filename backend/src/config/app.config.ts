const DEFAULT_BACKEND_PORT = 3000;
const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_NODE_ENV = "development";

function getOptionalEnvValue(key: string): string | undefined {
  return process.env[key];
}

function getNumberEnvValue(key: string, fallbackValue: number): number {
  const rawValue = getOptionalEnvValue(key);

  if (!rawValue) {
    return fallbackValue;
  }

  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid number environment variable: ${key}`);
  }

  return parsedValue;
}

function getStringEnvValue(key: string, fallbackValue: string): string {
  return getOptionalEnvValue(key) ?? fallbackValue;
}

export const APP_CONFIG = {
  PORT: getNumberEnvValue("BACKEND_PORT", DEFAULT_BACKEND_PORT),
  FRONTEND_URL: getStringEnvValue("FRONTEND_URL", DEFAULT_FRONTEND_URL),
  NODE_ENV: getStringEnvValue("NODE_ENV", DEFAULT_NODE_ENV),
} as const;