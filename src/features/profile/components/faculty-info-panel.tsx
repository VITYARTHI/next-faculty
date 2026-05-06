"use client";

import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { useFacultyStats } from "@/features/faculty/queries";
import { Pill } from "@/features/faculty/components/badges";
import type { ProfileFaculty, ProfileUser } from "../types";

interface Props {
  user: ProfileUser;
  faculty: ProfileFaculty | null;
}

export function FacultyInfoPanel({ user, faculty }: Props) {
  const { data: stats } = useFacultyStats();

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-6 py-4">
        <h3 className="text-base font-semibold">Faculty info</h3>
        <p className="text-xs text-muted-foreground">
          Read-only — provided by the faculty record.
        </p>
      </div>
      <dl className="space-y-5 p-6">
        <Field label="Login email">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Mail className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="break-all">{user.email}</span>
            {user.email_verified ? (
              <Pill tone="emerald">
                <CheckCircle2 className="size-3" />
                Verified
              </Pill>
            ) : (
              <Pill tone="amber">Unverified</Pill>
            )}
          </div>
        </Field>
        <Field label="Faculty record">
          {faculty ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <ShieldCheck className="size-3.5 shrink-0 text-muted-foreground" />
              <span>{faculty.name}</span>
              <span className="text-xs text-muted-foreground">
                #{faculty.id}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">Not linked</span>
          )}
        </Field>
        <Field label="Faculty email">
          {faculty?.email ? (
            <span className="break-all">{faculty.email}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Field>

        <div className="grid grid-cols-3 gap-4 border-t pt-5">
          <Stat
            label="Active slots"
            value={
              stats
                ? `${stats.totals.active_slots}/${stats.totals.total_slots}`
                : "—"
            }
          />
          <Stat
            label="Approved"
            value={stats ? stats.totals.approved_students : "—"}
          />
          <Stat
            label="Pending"
            value={stats ? stats.totals.pending_requests : "—"}
          />
        </div>
      </dl>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
