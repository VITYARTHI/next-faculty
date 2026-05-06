import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { profileApi } from "./api";
import type {
  LogoutOthersBody,
  UpdatePasswordBody,
  UpdateProfileBody,
} from "./types";

export const profileKeys = {
  all: ["profile"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: profileApi.get,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: profileKeys.all });
}

export function useUpdateProfile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: UpdateProfileBody) => profileApi.update(body),
    onSuccess: invalidate,
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (body: UpdatePasswordBody) => profileApi.updatePassword(body),
  });
}

export function useUploadPhoto() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadPhoto(file),
    onSuccess: invalidate,
  });
}

export function useDeletePhoto() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => profileApi.deletePhoto(),
    onSuccess: invalidate,
  });
}

export function useLogoutOtherSessions() {
  return useMutation({
    mutationFn: (body: LogoutOthersBody) => profileApi.logoutOthers(body),
  });
}
