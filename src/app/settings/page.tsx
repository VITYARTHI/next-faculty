"use client";

import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useProfile } from "@/features/profile/queries";
import { ProfilePanel } from "@/features/profile/components/profile-panel";
import { PasswordPanel } from "@/features/profile/components/password-panel";
import { SessionsPanel } from "@/features/profile/components/sessions-panel";
import { FacultyInfoPanel } from "@/features/profile/components/faculty-info-panel";
import { getErrorMessage } from "@/lib/api";

export default function SettingsPage() {
  const { data, isLoading, isError, error } = useProfile();

  return (
    <PageShell title="Settings" description="Profile, security, and account.">
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-destructive">
          {getErrorMessage(error, "Could not load profile")}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ProfilePanel profile={data} />
            <PasswordPanel />
            <SessionsPanel />
          </div>
          <div>
            <FacultyInfoPanel user={data.user} faculty={data.faculty} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
