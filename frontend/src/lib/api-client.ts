import { APP_CONFIG } from "../config/app.config";

const HTTP_HEADERS = {
  JSON: {
    "Content-Type": "application/json",
  },
} as const;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiClientRequestOptions {
  method: HttpMethod;
  body?: unknown;
}

async function parseJsonResponse<TResponse>(
  response: Response,
): Promise<TResponse> {
  return (await response.json()) as TResponse;
}

async function buildErrorMessage(response: Response): Promise<string> {
  const responseText = await response.text();

  if (!responseText) {
    return `Request failed with status ${response.status}`;
  }

  return `Request failed with status ${response.status}: ${responseText}`;
}

export async function apiClient<TResponse>(
  endpoint: string,
  options: ApiClientRequestOptions,
): Promise<TResponse> {
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}${endpoint}`, {
    method: options.method,
    credentials: "include",
    headers: HTTP_HEADERS.JSON,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response));
  }

  return parseJsonResponse<TResponse>(response);
}