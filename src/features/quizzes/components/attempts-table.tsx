"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataPagination } from "@/components/data-pagination";
import { useDebouncedValue } from "@/lib/hooks";
import { formatDateTime, nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { useSlots } from "@/features/faculty/queries";
import { useQuizAttempts } from "../queries";
import type { AttemptSort, AttemptStatus } from "../types";
import { AttemptStatusBadge, ViolationsPill } from "./badges";

const STATUSES: Array<{ value: AttemptStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In progress" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

type ViolationFilter = "all" | "true" | "false";

export function AttemptsTable({ quizId }: { quizId: number }) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState<AttemptStatus | "all">("all");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [violationsFilter, setViolationsFilter] = useState<ViolationFilter>("all");
  const [sort, setSort] = useState<AttemptSort>("newest");
  const [search, setSearch] = useState("");
  const [startedFrom, setStartedFrom] = useState("");
  const [startedUntil, setStartedUntil] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const slotsForFilter = useSlots({ per_page: 100 });

  const { data, isLoading, isFetching, isError, error } = useQuizAttempts(
    quizId,
    {
      page,
      per_page: perPage,
      status: statusFilter === "all" ? undefined : statusFilter,
      slot_id: slotFilter === "all" ? undefined : Number(slotFilter),
      has_violations:
        violationsFilter === "all" ? undefined : violationsFilter === "true",
      started_from: startedFrom || undefined,
      started_until: startedUntil || undefined,
      search: debouncedSearch || undefined,
      sort,
    },
  );

  const onFilterChange = () => setPage(1);
  const rows = data?.data ?? [];
  const COLS = 8;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or roll number…"
            value={search}
            className="pl-9"
            onChange={(e) => {
              setSearch(e.target.value);
              onFilterChange();
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v: AttemptStatus | "all") => {
            setStatusFilter(v);
            onFilterChange();
          }}
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={slotFilter}
          onValueChange={(v) => {
            setSlotFilter(v);
            onFilterChange();
          }}
          disabled={slotsForFilter.isLoading}
        >
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="All slots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All slots</SelectItem>
            {slotsForFilter.data?.data.map((slot) => (
              <SelectItem key={slot.id} value={String(slot.id)}>
                {slot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={violationsFilter}
          onValueChange={(v: ViolationFilter) => {
            setViolationsFilter(v);
            onFilterChange();
          }}
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any violations</SelectItem>
            <SelectItem value="true">With violations</SelectItem>
            <SelectItem value="false">No violations</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v: AttemptSort) => {
            setSort(v);
            onFilterChange();
          }}
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="score_desc">Score: high → low</SelectItem>
            <SelectItem value="score_asc">Score: low → high</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startedFrom}
            onChange={(e) => {
              setStartedFrom(e.target.value);
              onFilterChange();
            }}
            className="w-full lg:w-[160px]"
            aria-label="Started from"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={startedUntil}
            onChange={(e) => {
              setStartedUntil(e.target.value);
              onFilterChange();
            }}
            className="w-full lg:w-[160px]"
            aria-label="Started until"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Student</TableHead>
            <TableHead>Slot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Correct</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Violations</TableHead>
            <TableHead>Started</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLS + 1 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={COLS + 1} className="h-24 text-center text-sm text-destructive">
                {getErrorMessage(error, "Failed to load attempts")}
              </TableCell>
            </TableRow>
          ) : !rows.length ? (
            <TableRow>
              <TableCell colSpan={COLS + 1} className="h-24 text-center text-sm text-muted-foreground">
                No attempts found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((a) => (
              <TableRow key={a.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {a.user.photo && <AvatarImage src={a.user.photo} alt="" />}
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {nameInitials(a.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {a.user.name || "—"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {a.user.registration_number ?? a.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                  {a.slot?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <AttemptStatusBadge
                    isCompleted={a.is_completed}
                    passed={a.passed}
                  />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {a.score != null ? (
                    <span className="font-medium">{a.score.toFixed(1)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                  {a.correct_answers}/{a.total_questions}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {a.time_taken_formatted ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <ViolationsPill count={a.violations_total} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(a.started_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                  >
                    <Link href={`/quizzes/${quizId}/attempts/${a.id}`}>
                      Open <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="border-t px-5 py-3">
        <DataPagination
          meta={data?.meta}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          isLoading={isFetching}
        />
      </div>
    </div>
  );
}
