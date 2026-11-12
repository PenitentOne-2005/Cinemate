export const ENDPOINTS = {
  auth: {
    me: "/auth/me",
    username: "/auth/me/username",
    avatar: "/auth/me/avatar",
    refresh: "/auth/refresh",
  },
  friendships: {
    base: "/friendships",
    search: "/friendships/search",
    receivedRequests: "/friendships/requests/received",

    byUser: (userId: string) => `/friendships/${userId}`,
    accept: (userId: string) => `/friendships/${userId}/accept`,
    reject: (userId: string) => `/friendships/${userId}/reject`,
  },
} as const;
