export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  username: string;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Необходима авторизация") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
