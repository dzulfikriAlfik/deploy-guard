export const LOGGER_REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.x-api-key",
  "req.headers.x-csrf-token",
  "res.headers.set-cookie",
  "password",
  "passwordHash",
  "refreshToken",
  "accessToken",
  "apiKey",
  "token",
  "body.password",
  "body.refreshToken",
  "body.accessToken",
  "body.apiKey",
  "req.body.password",
  "req.body.refreshToken",
  "req.body.accessToken",
  "req.body.apiKey",
] as const;

export const LOGGER_REDACT_CENSOR = "[REDACTED]" as const;

export const REQUEST_ID_HEADER = "x-request-id" as const;