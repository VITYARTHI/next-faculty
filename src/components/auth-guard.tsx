"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authToken } from "@/lib/api";
import { isFaculty, useCurrentUser, useLogout } from "@/features/auth/queries";
import { Button } from "@/components/ui/button";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // Defer reading localStorage until after the first client render so the
  // SSR output (no token, spinner) matches the initial CSR output. Without
  // this, the client diverges on hydration if a token is already stored.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasToken = mounted && Boolean(authToken.get());
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!mounted) return;
    const redirect = `/login?redirect=${encodeURIComponent(pathname)}`;
    if (!hasToken) {
      router.replace(redirect);
      return;
    }
    if (isError) {
      authToken.clear();
      router.replace(redirect);
    }
  }, [mounted, hasToken, isError, pathname, router]);

  if (!mounted || !hasToken || isLoading || isError || !user) {
    return <FullPageSpinner />;
  }

  if (!isFaculty(user)) {
    return <NotFacultyScreen />;
  }

  return <>{children}</>;
}

function NotFacultyScreen() {
  const router = useRouter();
  const logout = useLogout();
  const handleSignOut = async () => {
    await logout.mutateAsync();
    router.replace("/login");
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-4">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            Your account is not linked to a faculty record.
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut} disabled={logout.isPending}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
