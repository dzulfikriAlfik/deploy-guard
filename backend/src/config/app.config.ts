import { ConfigService } from "@nestjs/config";

export const ENV_KEYS = {
  NODE_ENV: "NODE_ENV",
  BACKEND_PORT: "BACKEND_PORT",
  FRONTEND_URL: "FRONTEND_URL",
  LOG_LEVEL: "LOG_LEVEL",
  LOG_PRETTY: "LOG_PRETTY",
} as const;

const DEFAULT_NODE_ENV = "development";

export function getEnvFilePaths(): string[] {
  const nodeEnv = process.env[ENV_KEYS.NODE_ENV] ?? DEFAULT_NODE_ENV;

  return [`.env.${nodeEnv}`, ".env"];
}

export function getRequiredStringConfig(
  configService: ConfigService,
  key: string,
): string {
  const value = configService.get<string>(key);

  if (!value) {
    throw new Error(`Missing required config value: ${key}`);
  }

  return value;
}

export function getOptionalStringConfig(
  configService: ConfigService,
  key: string,
  fallbackValue: string,
): string {
  return configService.get<string>(key) ?? fallbackValue;
}

export function getRequiredNumberConfig(
  configService: ConfigService,
  key: string,
): number {
  const rawValue = getRequiredStringConfig(configService, key);
  const parsedValue = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Invalid number config value: ${key}`);
  }

  return parsedValue;
}

export function getOptionalBooleanConfig(
  configService: ConfigService,
  key: string,
  fallbackValue: boolean,
): boolean {
  const rawValue = configService.get<string>(key);

  if (!rawValue) {
    return fallbackValue;
  }

  return rawValue.toLowerCase() === "true";
}