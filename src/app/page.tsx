"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  Clock,
  Users,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/queries";
import { useFacultyStats } from "@/features/faculty/queries";
import {
  ActiveBadge,
  UtilizationBar,
} from "@/features/faculty/components/badges";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FacultyStatsTotals } from "@/features/faculty/types";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: stats, isLoading, isError, error } = useFacultyStats();
  const totals = stats?.totals;
  return (
    <PageShell
      title="Dashboard"
      description={
        user?.name ? `Welcome back, ${user.name}.` : "Faculty admin overview."
      }
    >
      {isError ? (
        <div className="rounded-lg border bg-card p-10 text-center text-sm text-destructive">
          {getErrorMessage(error, "Failed to load dashboard stats")}
        </div>
      ) : (
        <>
          <KpiGrid totals={totals} loading={isLoading} />
          <SlotsCard slots={stats?.slots ?? []} loading={isLoading} />
        </>
      )}
    </PageShell>
  );
}

function KpiGrid({
  totals,
  loading,
}: {
  totals: FacultyStatsTotals | undefined;
  loading: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        label="Active slots"
        value={totals && `${totals.active_slots}`}
        hint={totals && `of ${totals.total_slots} total`}
        icon={<CalendarRange className="size-5" />}
        tone="indigo"
        href="/slots"
        loading={loading}
      />
      <Kpi
        label="Approved students"
        value={totals?.approved_students}
        hint={
          totals
            ? `${totals.available_capacity} of ${totals.total_capacity} seats free`
            : undefined
        }
        icon={<Users className="size-5" />}
        tone="emerald"
        href="/registrations?status=approved"
        loading={loading}
      />
      <Kpi
        label="Pending requests"
        value={totals?.pending_requests}
        hint="awaiting decision"
        icon={<Clock className="size-5" />}
        tone="amber"
        href="/registrations?status=requested"
        loading={loading}
      />
      <Kpi
        label="Rejected"
        value={totals?.rejected_requests}
        hint="this term"
        icon={<XCircle className="size-5" />}
        tone="rose"
        href="/registrations?status=rejected"
        loading={loading}
      />
    </div>
  );
}

type Tone = "indigo" | "emerald" | "amber" | "rose";

const toneStyles: Record<Tone, string> = {
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
};

function Kpi({
  label,
  value,
  hint,
  icon,
  tone,
  href,
  loading,
}: {
  label: string;
  value: number | string | undefined;
  hint?: string;
  icon: React.ReactNode;
  tone: Tone;
  href: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="text-sm font-medium text-muted-foreground">
            {label}
          </div>
          {loading ? (
            <Skeleton className="h-9 w-20" />
          ) : (
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {value ?? 0}
            </div>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", toneStyles[tone])}>{icon}</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{hint ?? ""}</span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}

function SlotsCard({
  slots,
  loading,
}: {
  slots: {
    id: number;
    name: string;
    is_active: boolean;
    capacity: number;
    approved_count: number;
    requested_count: number;
    rejected_count: number;
    available_capacity: number;
    flipped_course: { name: string };
  }[];
  loading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">Slots</h2>
          <p className="text-xs text-muted-foreground">
            Per-slot capacity and registration counts.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/slots">
            View all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Slot</TableHead>
            <TableHead>Course</TableHead>
            <TableHead className="text-right">Approved</TableHead>
            <TableHead className="text-right">Requested</TableHead>
            <TableHead className="text-right">Rejected</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : slots.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No slots assigned to you yet.
              </TableCell>
            </TableRow>
          ) : (
            slots.map((slot) => {
              return (
                <TableRow key={slot.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{slot.name}</span>
                      <ActiveBadge active={slot.is_active} />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="truncate text-sm text-muted-foreground">
                      {slot.flipped_course?.name ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {slot.approved_count}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {slot.requested_count}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {slot.rejected_count}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm tabular-nums">
                        <span className="font-medium">
                          {slot.available_capacity}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}/ {slot.capacity}
                        </span>
                      </span>
                      <UtilizationBar
                        approved={slot.approved_count}
                        capacity={slot.capacity}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Link href={`/slots/${slot.id}`}>
                        View <ArrowUpRight className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
