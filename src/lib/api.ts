import axios, { AxiosError, type AxiosResponse } from "axios";

// All requests go to the same Next.js origin; next.config.ts rewrites
// /api/v1/* to the backend. This avoids CORS and keeps BACKEND_URL
// server-side only.
export const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authToken = {
  get: () =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
  set: (token: string) => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};

export const authUser = {
  get<T>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set<T>(user: T) {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
};

api.interceptors.request.use((config) => {
  const token = authToken.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      authToken.clear();
    }
    return Promise.reject(error);
  },
);

// ---- V1 envelope types ----------------------------------------------------

export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedEnvelope<T> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiError = AxiosError<ApiErrorBody>;

// ---- Helpers --------------------------------------------------------------

/** Unwraps the `data` field from a single-resource envelope. */
export const unwrap = <T>(res: AxiosResponse<ApiEnvelope<T>>): T => res.data.data;

/** Returns the full paginated envelope (data + meta + links). */
export const unwrapPage = <T>(
  res: AxiosResponse<PaginatedEnvelope<T>>,
): PaginatedEnvelope<T> => res.data;

/** Pulls a human-readable message out of any axios error. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
