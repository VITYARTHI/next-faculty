import { api, unwrap, type ApiEnvelope } from "@/lib/api";
import type {
  LogoutOthersBody,
  ProfileResponse,
  ProfileUser,
  UpdatePasswordBody,
  UpdateProfileBody,
} from "./types";

const MULTIPART_CONFIG = {
  headers: { "Content-Type": undefined as unknown as string },
};

export const profileApi = {
  get: () =>
    api.get<ApiEnvelope<ProfileResponse>>("/faculty/profile").then(unwrap),

  update: (body: UpdateProfileBody) =>
    api
      .patch<ApiEnvelope<ProfileResponse>>("/faculty/profile", body)
      .then(unwrap),

  updatePassword: (body: UpdatePasswordBody) =>
    api
      .patch<ApiEnvelope<null>>("/faculty/profile/password", body)
      .then((res) => res.data),

  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append("photo", file);
    return api
      .post<ApiEnvelope<{ photo_url: string; user?: ProfileUser }>>(
        "/faculty/profile/photo",
        fd,
        MULTIPART_CONFIG,
      )
      .then(unwrap);
  },

  deletePhoto: () =>
    api.delete<ApiEnvelope<null>>("/faculty/profile/photo"),

  logout: () =>
    api.post<ApiEnvelope<null>>("/faculty/sessions/logout"),

  logoutOthers: (body: LogoutOthersBody) =>
    api
      .post<ApiEnvelope<{ message?: string }>>(
        "/faculty/sessions/logout-others",
        body,
      )
      .then((res) => res.data),
};
