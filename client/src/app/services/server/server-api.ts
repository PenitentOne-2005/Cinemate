import "server-only";

import { cookies } from "next/headers";
import { API_URL } from "./constants";
import { redirect } from "next/navigation";

export async function serverApiRequest<T>(path: string): Promise<T> {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/");
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Неизвестная ошибка");

    throw new Error(`Ошибка запроса ${path}: ${response.status}\n${errorText}`);
  }

  const data = await response.json();

  return data as T;
}
