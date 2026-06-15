import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { REQUEST_ID_HEADER } from "./logging.constants";

export function resolveRequestId(request: IncomingMessage): string {
  const rawRequestId = request.headers[REQUEST_ID_HEADER];

  if (typeof rawRequestId === "string" && rawRequestId.trim().length > 0) {
    return rawRequestId;
  }

  if (
    Array.isArray(rawRequestId) &&
    typeof rawRequestId[0] === "string" &&
    rawRequestId[0].trim().length > 0
  ) {
    return rawRequestId[0];
  }

  return randomUUID();
}

export function resolveLogFilePath(logFilePath: string): string {
  return resolve(process.cwd(), logFilePath);
}

export function ensureLogFileDirectory(logFilePath: string): void {
  const resolvedLogFilePath = resolveLogFilePath(logFilePath);
  const logDirectory = dirname(resolvedLogFilePath);

  mkdirSync(logDirectory, {
    recursive: true,
  });
}