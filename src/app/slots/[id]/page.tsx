"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { useSlot } from "@/features/faculty/queries";
import {
  ActiveBadge,
  CapacityBadge,
  Pill,
  UtilizationBar,
} from "@/features/faculty/components/badges";
import { RegistrationsTable } from "@/features/faculty/components/registrations-table";
import { ProgressReportButton } from "@/features/faculty/components/progress-report-button";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function SlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const slotId = Number(id);
  const { data: slot, isLoading, isError, error } = useSlot(slotId);

  return (
    <PageShell
      title={slot?.name ?? "Slot"}
      description={slot?.flipped_course?.name}
      actions={
        <>
          {slot && (
            <ProgressReportButton
              slotId={slot.id}
              approvedCount={slot.approved_count}
            />
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href="/slots">
              <ArrowLeft className="size-4" /> All slots
            </Link>
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !slot ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-destructive">
          {getErrorMessage(error, "Slot not found")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {slot.name}
                  </h2>
                  <ActiveBadge active={slot.is_active} />
                  <CapacityBadge status={slot.capacity_status} />
                  <Pill tone={slot.is_registration_open ? "indigo" : "zinc"}>
                    {slot.is_registration_open
                      ? "Registration open"
                      : "Registration closed"}
                  </Pill>
                </div>
                {slot.description && (
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {slot.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarRange className="size-3.5" />
                    Deadline {formatDate(slot.registration_deadline)}
                  </span>
                  <span>{slot.flipped_course?.name ?? "—"}</span>
                </div>
              </div>
              <div className="min-w-[220px]">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Capacity
                </div>
                <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-2xl font-semibold">
                    {slot.approved_count}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of {slot.capacity}
                  </span>
                </div>
                <UtilizationBar
                  approved={slot.approved_count}
                  capacity={slot.capacity}
                  className="mt-2 w-full"
                />
                <div className="mt-1 text-xs text-muted-foreground">
                  {slot.available_capacity} seat
                  {slot.available_capacity === 1 ? "" : "s"} available
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SlotStat
              label="Approved"
              value={slot.approved_count}
              icon={<CheckCircle2 className="size-5" />}
              tone="emerald"
            />
            <SlotStat
              label="Requested"
              value={slot.requested_count}
              icon={<Clock className="size-5" />}
              tone="amber"
            />
            <SlotStat
              label="Rejected"
              value={slot.rejected_count}
              icon={<XCircle className="size-5" />}
              tone="rose"
            />
            <SlotStat
              label="Available"
              value={slot.available_capacity}
              icon={<Users className="size-5" />}
              tone="indigo"
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Registrations</h2>
            </div>
            <RegistrationsTable slotId={slotId} embedded />
          </div>
        </div>
      )}
    </PageShell>
  );
}

const slotToneStyles: Record<
  "indigo" | "emerald" | "amber" | "rose",
  string
> = {
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
};

function SlotStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: keyof typeof slotToneStyles;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-muted-foreground">
            {label}
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
            {value}
          </div>
        </div>
        <div className={cn("rounded-lg p-2.5", slotToneStyles[tone])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
