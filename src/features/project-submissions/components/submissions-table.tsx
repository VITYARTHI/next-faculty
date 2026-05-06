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
import { useSubmissionsList } from "../queries";
import type {
  ProjectSubmissionStatus,
  SubmissionsSort,
} from "../types";
import { SubmissionStatusBadge } from "./badges";

const STATUSES: Array<{ value: ProjectSubmissionStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "graded", label: "Graded" },
  { value: "rejected", label: "Rejected" },
];

export function SubmissionsTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState<ProjectSubmissionStatus | "all">("all");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [sort, setSort] = useState<SubmissionsSort>("newest");
  const [search, setSearch] = useState("");
  const [submittedFrom, setSubmittedFrom] = useState("");
  const [submittedUntil, setSubmittedUntil] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const slotsForFilter = useSlots({ per_page: 100 });

  const { data, isLoading, isFetching, isError, error } = useSubmissionsList({
    page,
    per_page: perPage,
    status: statusFilter === "all" ? undefined : statusFilter,
    slot_id: slotFilter === "all" ? undefined : Number(slotFilter),
    search: debouncedSearch || undefined,
    submitted_from: submittedFrom || undefined,
    submitted_until: submittedUntil || undefined,
    sort,
  });

  const onFilterChange = () => setPage(1);
  const rows = data?.data ?? [];
  const COLS = 7;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student or project…"
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
          onValueChange={(v: ProjectSubmissionStatus | "all") => {
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
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue placeholder="All slots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All slots</SelectItem>
            {slotsForFilter.data?.data.map((slot) => (
              <SelectItem key={slot.id} value={String(slot.id)}>
                <span className="font-medium">{slot.name}</span>
                {slot.flipped_course?.name && (
                  <span className="ml-2 text-muted-foreground">
                    · {slot.flipped_course.name}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v: SubmissionsSort) => {
            setSort(v);
            onFilterChange();
          }}
        >
          <SelectTrigger className="w-full lg:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={submittedFrom}
            onChange={(e) => {
              setSubmittedFrom(e.target.value);
              onFilterChange();
            }}
            className="w-full lg:w-[160px]"
            aria-label="Submitted from"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={submittedUntil}
            onChange={(e) => {
              setSubmittedUntil(e.target.value);
              onFilterChange();
            }}
            className="w-full lg:w-[160px]"
            aria-label="Submitted until"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Student</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLS }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={COLS} className="h-24 text-center text-sm text-destructive">
                {getErrorMessage(error, "Failed to load submissions")}
              </TableCell>
            </TableRow>
          ) : !rows.length ? (
            <TableRow>
              <TableCell colSpan={COLS} className="h-24 text-center text-sm text-muted-foreground">
                No submissions found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((s) => (
              <TableRow key={s.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {s.user.photo && <AvatarImage src={s.user.photo} alt="" />}
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {nameInitials(s.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {s.user.name || "—"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {s.user.registration_number ?? s.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <Link
                    href={`/project-submissions/${s.id}`}
                    className="block truncate text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {s.course_project?.title ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="truncate text-sm text-muted-foreground">
                    {s.course_project?.course?.name ?? "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <SubmissionStatusBadge status={s.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.score != null ? (
                    <span className="font-medium">{s.score}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(s.submitted_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                  >
                    <Link href={`/project-submissions/${s.id}`}>
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
