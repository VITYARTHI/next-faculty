"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Check,
  Hash,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { useRegistration } from "@/features/faculty/queries";
import { RegistrationStatusBadge } from "@/features/faculty/components/badges";
import {
  RegistrationActionDialog,
  type Action,
} from "@/features/faculty/components/action-dialog";
import { formatDateTime, nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";

export default function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const registrationId = Number(id);
  const { data: reg, isLoading, isError, error } = useRegistration(registrationId);
  const [action, setAction] = useState<Action | null>(null);

  const canApprove = reg?.status === "requested";
  const canReject = reg?.status === "requested" || reg?.status === "approved";
  const isApproved = reg?.status === "approved";

  return (
    <PageShell
      title="Registration"
      description={reg ? `#${reg.id}` : undefined}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/registrations">
              <ArrowLeft className="size-4" /> All registrations
            </Link>
          </Button>
          {isApproved && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/registrations/${registrationId}/progress`}>
                <BarChart3 className="size-4" />
                Progress
              </Link>
            </Button>
          )}
          {canApprove && (
            <Button size="sm" onClick={() => setAction("approve")}>
              <Check className="size-4" />
              Approve
            </Button>
          )}
          {canReject && (
            <Button
              size="sm"
              variant={isApproved ? "outline" : "destructive"}
              onClick={() => setAction("reject")}
            >
              <X className="size-4" />
              {isApproved ? "Revoke" : "Reject"}
            </Button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !reg ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-destructive">
          {getErrorMessage(error, "Registration not found")}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-start">
                <Avatar className="size-14">
                  {reg.user.photo && <AvatarImage src={reg.user.photo} alt="" />}
                  <AvatarFallback className="bg-primary/10 text-base font-medium text-primary">
                    {nameInitials(reg.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {reg.user.name || "—"}
                    </h2>
                    <RegistrationStatusBadge status={reg.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {reg.user.email}
                    </span>
                    {reg.user.registration_number && (
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="size-3.5" />
                        {reg.user.registration_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <dl className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
                <Field label="Slot">
                  <Link
                    href={`/slots/${reg.flipped_course_slot.id}`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    {reg.flipped_course_slot.name}
                  </Link>
                </Field>
                <Field label="Course">
                  {reg.flipped_course_slot.flipped_course?.name ?? "—"}
                </Field>
                <Field label="Registered">
                  {formatDateTime(reg.registered_at)}
                </Field>
                <Field label="Approved">
                  {formatDateTime(reg.approved_at)}
                </Field>
                <Field label="Rejected">
                  {formatDateTime(reg.rejected_at)}
                </Field>
                <Field label="Approved by">
                  {reg.approved_by?.name ?? "—"}
                </Field>
              </dl>
            </div>
          </div>

          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h3 className="text-base font-semibold">Notes</h3>
              <p className="text-xs text-muted-foreground">
                Comments on this registration.
              </p>
            </div>
            <div className="space-y-5 p-5 text-sm">
              <NoteBlock label="Student note" value={reg.student_notes} />
              <NoteBlock label="Admin note" value={reg.admin_notes} />
            </div>
          </div>
        </div>
      )}

      {action && reg && (
        <RegistrationActionDialog
          mode="single"
          action={action}
          registrationId={reg.id}
          open
          onOpenChange={(open) => !open && setAction(null)}
        />
      )}
    </PageShell>
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

function NoteBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {value ? (
        <p className="mt-1.5 whitespace-pre-wrap leading-relaxed">{value}</p>
      ) : (
        <p className="mt-1.5 text-muted-foreground">—</p>
      )}
    </div>
  );
}
