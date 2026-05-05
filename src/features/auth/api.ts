import { api, unwrap, type ApiEnvelope } from "@/lib/api";
import type { AuthUser, LoginInput, LoginResponse } from "./schema";

export const authApi = {
  // Backend returns the standard envelope; data shape may include token alone
  // or token + user. We tolerate both and fetch the user separately.
  login: (input: LoginInput) =>
    api.post<ApiEnvelope<LoginResponse>>("/auth/login", input).then(unwrap),

  me: () => api.get<ApiEnvelope<AuthUser>>("/auth/user").then(unwrap),

  logout: () => api.post("/auth/logout").then(() => undefined),
};
