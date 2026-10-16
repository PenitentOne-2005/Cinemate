import { ApiError, UnauthorizedError } from "../types/auth.types";

const API_URL = "http://localhost:3000";

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("Сервер недоступен. Проверь соединение.", 0);
  }

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new ApiError(`Ошибка запроса: ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export default apiRequest;
