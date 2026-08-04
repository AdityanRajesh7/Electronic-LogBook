export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.error("VITE_API_URL is not set — API requests will fail in production");
}

/**
 * Helper to retrieve the current user session (we are not using JWTs/Bearer tokens yet).
 * Note: This is a temporary mechanism until real auth is implemented.
 */
function getAuthToken(): string | null {
  // We're not using a Bearer token yet. For now, the backend might rely on cookies
  // or we might send the user ID in a header if needed. Since we don't have JWT infra,
  // we will not fake a Bearer token.
  return null;
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // Note: We are explicitly not faking a Bearer token here since we have no JWT infra yet.
  // The token logic is removed/commented out until real auth is implemented.
  /*
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  */

  // Automatically set Content-Type to JSON for requests with body, if not already set
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      throw new ApiError(response.status, `Non-JSON response: ${text.slice(0, 200)}`, null);
    }

    try {
      errorData = await response.json();
    } catch {
      // Not JSON, ignore
    }
    const errorMessage = errorData?.message || response.statusText || "An API error occurred";
    throw new ApiError(response.status, errorMessage, errorData);
  }

  // Allow empty responses (e.g. 204 No Content)
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new ApiError(response.status, `Non-JSON response: ${text.slice(0, 200)}`, null);
  }

  return response.json();
}

export function apiGet<T = any>(path: string, options?: RequestInit): Promise<T> {
  return fetchWithAuth(path, { ...options, method: "GET" });
}

export function apiPost<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
  return fetchWithAuth(path, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
  return fetchWithAuth(path, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = any>(path: string, options?: RequestInit): Promise<T> {
  return fetchWithAuth(path, { ...options, method: "DELETE" });
}
