"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, MessageCircle } from "lucide-react";
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
import { useQnaList } from "../queries";
import type { QnaSort, QnaStatus } from "../types";
import { QnaStatusBadge } from "./badges";

const STATUSES: Array<{ value: QnaStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "answered", label: "Answered" },
  { value: "closed", label: "Closed" },
];

export function QnaTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState<QnaStatus | "all">("all");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [sort, setSort] = useState<QnaSort>("newest");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const slotsForFilter = useSlots({ per_page: 100 });

  const { data, isLoading, isFetching, isError, error } = useQnaList({
    page,
    per_page: perPage,
    status: statusFilter === "all" ? undefined : statusFilter,
    slot_id: slotFilter === "all" ? undefined : Number(slotFilter),
    search: debouncedSearch || undefined,
    sort,
  });

  const onFilterChange = () => setPage(1);
  const rows = data?.data ?? [];
  const COLS = 6;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, description, student…"
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
          onValueChange={(v: QnaStatus | "all") => {
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
          onValueChange={(v: QnaSort) => {
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
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Question</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Slot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Replies</TableHead>
            <TableHead>Asked</TableHead>
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
              <TableCell
                colSpan={COLS + 1}
                className="h-24 text-center text-sm text-destructive"
              >
                {getErrorMessage(error, "Failed to load questions")}
              </TableCell>
            </TableRow>
          ) : !rows.length ? (
            <TableRow>
              <TableCell
                colSpan={COLS + 1}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No questions found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((q) => (
              <TableRow key={q.id} className="group">
                <TableCell className="max-w-[360px]">
                  <Link
                    href={`/qna/${q.id}`}
                    className="block truncate text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {q.title}
                  </Link>
                  {q.description && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {q.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-7">
                      {q.user.photo && <AvatarImage src={q.user.photo} alt="" />}
                      <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                        {nameInitials(q.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm">{q.user.name || "—"}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {q.user.registration_number ?? q.user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <div className="truncate text-sm">
                    {q.flipped_course_slot?.name ?? "—"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {q.flipped_course_slot?.flipped_course?.name ?? ""}
                  </div>
                </TableCell>
                <TableCell>
                  <QnaStatusBadge status={q.status} />
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1 text-sm tabular-nums text-muted-foreground">
                    <MessageCircle className="size-3.5" />
                    {q.replies_count}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(q.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                  >
                    <Link href={`/qna/${q.id}`}>
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
