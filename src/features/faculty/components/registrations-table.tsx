"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  Check,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useRegistrations,
  useSlotRegistrations,
  useSlots,
} from "../queries";
import type {
  ListRegistrationsParams,
  RegistrationStatus,
} from "../types";
import { RegistrationStatusBadge } from "./badges";
import {
  RegistrationActionDialog,
  type Action,
} from "./action-dialog";

interface RegistrationsTableProps {
  /** When provided, scopes the list to a single slot via the dedicated endpoint. */
  slotId?: number;
  /** Hide columns/filters that don't make sense in nested contexts. */
  embedded?: boolean;
}

const STATUSES: RegistrationStatus[] = [
  "approved",
  "requested",
  "rejected",
  "cancelled",
];

// Bulk approve only works on `requested`. Bulk reject works on requested OR
// approved (per spec, reject can also revoke an approval). Single-row inline
// actions follow the same rules.
function canApprove(status: RegistrationStatus) {
  return status === "requested";
}
function canReject(status: RegistrationStatus) {
  return status === "requested" || status === "approved";
}

export function RegistrationsTable({ slotId, embedded }: RegistrationsTableProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [status, setStatus] = useState<RegistrationStatus>("approved");
  const [search, setSearch] = useState("");
  const [approvedFrom, setApprovedFrom] = useState("");
  const [approvedUntil, setApprovedUntil] = useState("");
  // "all" | "<slot id>" — only used when not embedded under a slot.
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const debouncedSearch = useDebouncedValue(search, 350);

  // Populate the slot filter dropdown. Skip the request entirely on the
  // slot-detail embed since the filter isn't shown there.
  const slotsForFilter = useSlots({ per_page: 100 }, { enabled: !embedded && !slotId });

  const sharedParams: Omit<ListRegistrationsParams, "slot_id"> = {
    page,
    per_page: perPage,
    status,
    search: debouncedSearch || undefined,
    approved_from: status === "approved" && approvedFrom ? approvedFrom : undefined,
    approved_until: status === "approved" && approvedUntil ? approvedUntil : undefined,
  };

  const filteredSlotId = slotFilter === "all" ? undefined : Number(slotFilter);

  const slotQuery = useSlotRegistrations(slotId ?? 0, sharedParams);
  const globalQuery = useRegistrations({ ...sharedParams, slot_id: filteredSlotId });
  const { data, isLoading, isFetching, isError, error } = slotId ? slotQuery : globalQuery;

  const onFilterChange = () => {
    setPage(1);
    setSelected(new Set());
  };

  // ---- Selection (resets when filters or page change) -------------------
  const [selected, setSelected] = useState<Set<number>>(new Set());
  useEffect(() => {
    setSelected(new Set());
  }, [page, status, debouncedSearch, approvedFrom, approvedUntil, slotFilter]);

  const rows = data?.data ?? [];
  const selectableIds = useMemo(
    () =>
      rows
        .filter((r) => canApprove(r.status) || canReject(r.status))
        .map((r) => r.id),
    [rows],
  );
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
  const someSelected = !allSelected && selectableIds.some((id) => selected.has(id));

  const toggleAll = (checked: boolean) => {
    if (checked) setSelected(new Set(selectableIds));
    else setSelected(new Set());
  };
  const toggleOne = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // ---- Action dialog state ----------------------------------------------
  type DialogState =
    | { kind: "single"; action: Action; id: number }
    | { kind: "bulk"; action: Action; ids: number[] }
    | null;
  const [dialog, setDialog] = useState<DialogState>(null);

  // For bulk reject we need *all* selected ids regardless of their current
  // status (the backend will skip ones it can't act on). For bulk approve we
  // narrow to those that are actually `requested` so the user isn't surprised
  // when the rest are skipped — but the API tolerates either.
  const selectedRows = rows.filter((r) => selected.has(r.id));
  const bulkApproveIds = selectedRows.filter((r) => canApprove(r.status)).map((r) => r.id);
  const bulkRejectIds = selectedRows.filter((r) => canReject(r.status)).map((r) => r.id);

  // ---- Render ------------------------------------------------------------
  const colCount = embedded ? 5 : 6;
  const totalCols = colCount + 2; // selection + action

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:items-center">
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
          value={status}
          onValueChange={(v: RegistrationStatus) => {
            setStatus(v);
            onFilterChange();
          }}
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!slotId && (
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
        )}
        {status === "approved" && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={approvedFrom}
              onChange={(e) => {
                setApprovedFrom(e.target.value);
                onFilterChange();
              }}
              className="w-full lg:w-[160px]"
              aria-label="Approved from"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={approvedUntil}
              onChange={(e) => {
                setApprovedUntil(e.target.value);
                onFilterChange();
              }}
              className="w-full lg:w-[160px]"
              aria-label="Approved until"
            />
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3">
          <div className="text-sm">
            <span className="font-medium">{selected.size}</span>
            <span className="text-muted-foreground"> selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkApproveIds.length === 0}
              onClick={() =>
                setDialog({ kind: "bulk", action: "approve", ids: bulkApproveIds })
              }
            >
              <CheckCircle2 className="size-4" />
              Approve {bulkApproveIds.length}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={bulkRejectIds.length === 0}
              onClick={() =>
                setDialog({ kind: "bulk", action: "reject", ids: bulkRejectIds })
              }
            >
              <XCircle className="size-4" />
              Reject {bulkRejectIds.length}
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected || (someSelected && "indeterminate")}
                onCheckedChange={(v) => toggleAll(Boolean(v))}
                disabled={selectableIds.length === 0}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Roll No.</TableHead>
            {!embedded && <TableHead>Slot</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>{status === "approved" ? "Approved" : "Registered"}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: totalCols }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={totalCols} className="h-24 text-center text-sm text-destructive">
                {getErrorMessage(error, "Failed to load registrations")}
              </TableCell>
            </TableRow>
          ) : !rows.length ? (
            <TableRow>
              <TableCell colSpan={totalCols} className="h-24 text-center text-sm text-muted-foreground">
                No registrations found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((reg) => {
              const selectable = canApprove(reg.status) || canReject(reg.status);
              return (
                <TableRow key={reg.id} className="group">
                  <TableCell className="w-10">
                    {selectable && (
                      <Checkbox
                        checked={selected.has(reg.id)}
                        onCheckedChange={(v) => toggleOne(reg.id, Boolean(v))}
                        aria-label={`Select registration ${reg.id}`}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {reg.user.photo && <AvatarImage src={reg.user.photo} alt="" />}
                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                          {nameInitials(reg.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {reg.user.name || "—"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {reg.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {reg.user.registration_number ?? "—"}
                  </TableCell>
                  {!embedded && (
                    <TableCell className="max-w-[240px]">
                      <div className="truncate text-sm font-medium">
                        {reg.flipped_course_slot?.name ?? "—"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {reg.flipped_course_slot?.flipped_course?.name ?? ""}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <RegistrationStatusBadge status={reg.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(
                      reg.status === "approved" ? reg.approved_at : reg.registered_at,
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      {canApprove(reg.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          onClick={() =>
                            setDialog({ kind: "single", action: "approve", id: reg.id })
                          }
                        >
                          <Check className="size-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                      )}
                      {canReject(reg.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                          onClick={() =>
                            setDialog({ kind: "single", action: "reject", id: reg.id })
                          }
                        >
                          <X className="size-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      )}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/registrations/${reg.id}`}>
                          View <ArrowUpRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
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

      {dialog?.kind === "single" && (
        <RegistrationActionDialog
          mode="single"
          action={dialog.action}
          registrationId={dialog.id}
          open
          onOpenChange={(open) => !open && setDialog(null)}
        />
      )}
      {dialog?.kind === "bulk" && (
        <RegistrationActionDialog
          mode="bulk"
          action={dialog.action}
          ids={dialog.ids}
          open
          onOpenChange={(open) => !open && setDialog(null)}
          onCompleted={() => setSelected(new Set())}
        />
      )}
    </div>
  );
}
