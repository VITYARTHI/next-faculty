import { api, unwrap, type ApiEnvelope } from "@/lib/api";
import type { AuthUser, LoginInput, LoginResponse } from "./schema";

export const authApi = {
  // Backend returns the standard envelope; data shape may include token alone
  // or token + user. We tolerate both and fetch the user separately.
  login: ({ turnstile_token, ...input }: LoginInput) =>
    api
      .post<ApiEnvelope<LoginResponse>>("/auth/login", {
        ...input,
        // Cloudflare Turnstile's official field name. We also send a
        // snake_case alias so the backend can pick whichever it expects.
        "cf-turnstile-response": turnstile_token,
        turnstile_token,
      })
      .then(unwrap),

  me: () => api.get<ApiEnvelope<AuthUser>>("/auth/user").then(unwrap),

  logout: () => api.post("/auth/logout").then(() => undefined),
};
