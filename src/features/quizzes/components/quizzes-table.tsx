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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataPagination } from "@/components/data-pagination";
import { useDebouncedValue } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/api";
import { ActiveBadge } from "@/features/faculty/components/badges";
import { useQuizzes } from "../queries";

type ActiveFilter = "all" | "true" | "false";

export function QuizzesTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [active, setActive] = useState<ActiveFilter>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, isError, error } = useQuizzes({
    page,
    per_page: perPage,
    is_active: active === "all" ? undefined : active === "true",
    search: debouncedSearch || undefined,
  });

  const onFilterChange = () => setPage(1);
  const rows = data?.data ?? [];
  const COLS = 7;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quiz titles…"
            value={search}
            className="pl-9"
            onChange={(e) => {
              setSearch(e.target.value);
              onFilterChange();
            }}
          />
        </div>
        <Select
          value={active}
          onValueChange={(v: ActiveFilter) => {
            setActive(v);
            onFilterChange();
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All quizzes</SelectItem>
            <SelectItem value="true">Active only</SelectItem>
            <SelectItem value="false">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Quiz</TableHead>
            <TableHead>Course</TableHead>
            <TableHead className="text-right">Questions</TableHead>
            <TableHead className="text-right">Attempts</TableHead>
            <TableHead className="text-right">Completed</TableHead>
            <TableHead className="text-right">Avg score</TableHead>
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
                {getErrorMessage(error, "Failed to load quizzes")}
              </TableCell>
            </TableRow>
          ) : !rows.length ? (
            <TableRow>
              <TableCell colSpan={COLS} className="h-24 text-center text-sm text-muted-foreground">
                No quizzes found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((q) => (
              <TableRow key={q.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/quizzes/${q.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {q.title}
                    </Link>
                    <ActiveBadge active={q.is_active} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pass ≥ {q.passing_score}%
                  </div>
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <div className="truncate text-sm text-muted-foreground">
                    {q.flipped_course?.name ?? "—"}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {q.questions_count}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {q.attempts_count}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {q.completed_count}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {q.avg_score != null ? (
                    <span className="font-medium">
                      {q.avg_score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                  >
                    <Link href={`/quizzes/${q.id}`}>
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
