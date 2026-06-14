function getRequiredEnvValue(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const APP_CONFIG = {
  API_BASE_URL: getRequiredEnvValue(
    import.meta.env.VITE_API_BASE_URL,
    "VITE_API_BASE_URL",
  ),
} as const;