import { ApiError, UnauthorizedError } from "../../types/auth.types";
import { API_URL } from "./constants";
import refreshAccessToken from "./refreshAccessToken";

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  async function sendRequest(): Promise<Response> {
    try {
      return await fetch(`${API_URL}${path}`, {
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
  }

  let response = await sendRequest();

  if (response.status === 401 && path !== "/auth/refresh") {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      response = await sendRequest();
    }
  }

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    let message = `Ошибка запроса: ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data.message === "string") {
        message = data.message;
      } else if (Array.isArray(data.message)) {
        message = data.message.join(", ");
      }
    } catch {
      // Ответ сервера не содержит JSON.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export default apiRequest;
