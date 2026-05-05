"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
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
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { useSlots } from "../queries";
import { ActiveBadge, UtilizationBar } from "./badges";

type ActiveFilter = "all" | "true" | "false";

const COLS = 6;

export function SlotsTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [active, setActive] = useState<ActiveFilter>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const { data, isLoading, isFetching, isError, error } = useSlots({
    page,
    per_page: perPage,
    is_active: active === "all" ? undefined : active === "true",
    search: debouncedSearch || undefined,
  });

  const onFilterChange = () => setPage(1);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search slots…"
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
            <SelectItem value="all">All slots</SelectItem>
            <SelectItem value="true">Active only</SelectItem>
            <SelectItem value="false">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Slot</TableHead>
            <TableHead>Course</TableHead>
            <TableHead className="text-right">Approved</TableHead>
            <TableHead className="text-right">Requested</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={COLS + 1} className="h-24 text-center text-sm text-destructive">
                {getErrorMessage(error, "Failed to load slots")}
              </TableCell>
            </TableRow>
          ) : !data?.data.length ? (
            <TableRow>
              <TableCell colSpan={COLS + 1} className="h-24 text-center text-sm text-muted-foreground">
                No slots found.
              </TableCell>
            </TableRow>
          ) : (
            data.data.map((slot) => (
              <TableRow key={slot.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{slot.name}</span>
                    <ActiveBadge active={slot.is_active} />
                  </div>
                  {slot.description && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {slot.description}
                    </div>
                  )}
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
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm tabular-nums">
                      <span className="font-medium">
                        {Math.max(slot.capacity - slot.approved_count, 0)}
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
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(slot.registration_deadline)}
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
