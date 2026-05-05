import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { authToken, authUser } from "@/lib/api";
import type { AuthUser, LoginInput } from "./schema";

export const authKeys = {
  user: ["auth", "user"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: authApi.me,
    retry: false,
    // /auth/user may not include is_faculty/faculty (only login does). We
    // hydrate from localStorage so a page refresh keeps the merged user, and
    // we never auto-refetch over it for the lifetime of the session.
    initialData: () => authUser.get<AuthUser>() ?? undefined,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: typeof window === "undefined" ? false : Boolean(authToken.get()),
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput): Promise<AuthUser> => {
      const res = await authApi.login(input);
      authToken.set(res.token);

      // The `is_faculty` / `faculty` flags may be at the top level OR nested
      // under `user`. Merge whichever the backend gave us.
      const base = res.user ?? (await authApi.me());
      return {
        ...base,
        is_faculty: base.is_faculty ?? res.is_faculty ?? false,
        faculty: base.faculty ?? res.faculty ?? null,
      } as AuthUser;
    },
    onSuccess: (user) => {
      authUser.set(user);
      qc.setQueryData(authKeys.user, user);
    },
    onError: () => {
      authToken.clear();
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout().catch(() => undefined),
    onSettled: () => {
      authToken.clear();
      qc.clear();
    },
  });
}

export function isFaculty(user: AuthUser | undefined | null): boolean {
  return Boolean(user?.is_faculty);
}
