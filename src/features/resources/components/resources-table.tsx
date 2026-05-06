"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EllipsisVertical,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataPagination } from "@/components/data-pagination";
import { useDebouncedValue } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/api";
import { ActiveBadge } from "@/features/faculty/components/badges";
import { useSlots } from "@/features/faculty/queries";
import {
  useBulkDeleteResources,
  useBulkToggleResources,
  useDeleteResource,
  useResources,
  useToggleResourceActive,
} from "../queries";
import type { Resource } from "../types";
import { ResourceFormDialog } from "./resource-form-dialog";

type ActiveFilter = "all" | "true" | "false";

export function ResourcesTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [active, setActive] = useState<ActiveFilter>("all");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const slotsForFilter = useSlots({ per_page: 100 });

  const { data, isLoading, isFetching, isError, error } = useResources({
    page,
    per_page: perPage,
    is_active: active === "all" ? undefined : active === "true",
    flipped_course_slot_id:
      slotFilter === "all" ? undefined : Number(slotFilter),
    search: debouncedSearch || undefined,
  });

  const onFilterChange = () => {
    setPage(1);
    setSelected(new Set());
  };

  // Selection
  const [selected, setSelected] = useState<Set<number>>(new Set());
  useEffect(() => {
    setSelected(new Set());
  }, [page, active, slotFilter, debouncedSearch]);

  const rows = data?.data ?? [];
  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = !allSelected && allIds.some((id) => selected.has(id));

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(allIds) : new Set());
  const toggleOne = (id: number, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  // Mutations
  const toggleActive = useToggleResourceActive();
  const removeOne = useDeleteResource();
  const bulkToggle = useBulkToggleResources();
  const bulkDelete = useBulkDeleteResources();

  // UI dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Resource | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const onToggle = async (id: number) => {
    try {
      await toggleActive.mutateAsync(id);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not toggle"));
    }
  };

  const onDelete = async () => {
    if (!confirmDelete) return;
    try {
      await removeOne.mutateAsync(confirmDelete.id);
      toast.success("Resource deleted");
      setConfirmDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete"));
    }
  };

  const onBulkToggle = async () => {
    if (selected.size === 0) return;
    try {
      const result = await bulkToggle.mutateAsync(Array.from(selected));
      toast.success(`Toggled ${result.toggled}`);
      setSelected(new Set());
    } catch (err) {
      toast.error(getErrorMessage(err, "Bulk toggle failed"));
    }
  };

  const onBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      const result = await bulkDelete.mutateAsync(Array.from(selected));
      const skipped = result.skipped.length;
      if (result.deleted === 0 && skipped > 0) {
        toast.error("Nothing deleted.", {
          description: `${skipped} skipped.`,
        });
      } else if (skipped > 0) {
        toast.success(`${result.deleted} deleted.`, {
          description: `${skipped} skipped.`,
        });
      } else {
        toast.success(`${result.deleted} deleted.`);
      }
      setSelected(new Set());
      setConfirmBulkDelete(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Bulk delete failed"));
    }
  };

  const COLS = 6;

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b px-5 py-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title or description…"
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
            <SelectTrigger className="w-full lg:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Visible</SelectItem>
              <SelectItem value="false">Hidden</SelectItem>
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
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New resource
          </Button>
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
                onClick={onBulkToggle}
                disabled={bulkToggle.isPending}
              >
                {bulkToggle.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Toggle visibility
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmBulkDelete(true)}
                disabled={bulkDelete.isPending}
              >
                <Trash2 className="size-4" />
                Delete {selected.size}
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
                  disabled={allIds.length === 0}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: COLS + 2 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={COLS + 2}
                  className="h-24 text-center text-sm text-destructive"
                >
                  {getErrorMessage(error, "Failed to load resources")}
                </TableCell>
              </TableRow>
            ) : !rows.length ? (
              <TableRow>
                <TableCell
                  colSpan={COLS + 2}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  No resources yet. Click <span className="font-medium">New resource</span> to add one.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} className="group">
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={(v) => toggleOne(r.id, Boolean(v))}
                      aria-label={`Select ${r.title}`}
                    />
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    {(r.download_url ?? r.file_url) ? (
                      <a
                        href={(r.download_url ?? r.file_url) as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 truncate font-medium underline-offset-4 hover:underline"
                      >
                        {r.title}
                        <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                      </a>
                    ) : (
                      <span className="font-medium">{r.title}</span>
                    )}
                    {r.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {r.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <div className="truncate text-sm">
                      {r.flipped_course_slot?.name ?? "—"}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {r.flipped_course_slot?.flipped_course?.name ?? ""}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm uppercase text-muted-foreground tabular-nums">
                    {r.file_extension ??
                      (r.file_url || r.download_url ? "url" : "—")}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {r.file_size_formatted ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ActiveBadge active={r.is_active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(r.download_url ?? r.file_url) && (
                        <Button asChild size="sm" variant="ghost" title="View">
                          <a
                            href={(r.download_url ?? r.file_url) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {r.file_path ? (
                              <FileText className="size-4" />
                            ) : (
                              <ExternalLink className="size-4" />
                            )}
                            <span className="sr-only">View</span>
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onToggle(r.id)}
                        disabled={toggleActive.isPending}
                        title={r.is_active ? "Hide" : "Show"}
                      >
                        {r.is_active ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <EllipsisVertical className="size-4" />
                            <span className="sr-only">More</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditing(r);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-4" /> Edit
                          </DropdownMenuItem>
                          {(r.download_url ?? r.file_url) && (
                            <DropdownMenuItem asChild>
                              <a
                                href={(r.download_url ?? r.file_url) as string}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="size-4" /> Open
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onSelect={() => setConfirmDelete(r)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

      {formOpen && (
        <ResourceFormDialog
          open
          onOpenChange={(o) => {
            setFormOpen(o);
            if (!o) setEditing(null);
          }}
          resource={editing}
        />
      )}

      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete resource?</DialogTitle>
            <DialogDescription>
              {confirmDelete && (
                <>
                  This permanently removes <span className="font-medium">{confirmDelete.title}</span>
                  {confirmDelete.file_path && " and its uploaded file"}. This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={removeOne.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={removeOne.isPending}
            >
              {removeOne.isPending && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selected.size} resources?</DialogTitle>
            <DialogDescription>
              Uploaded files will be removed from storage. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmBulkDelete(false)}
              disabled={bulkDelete.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onBulkDelete}
              disabled={bulkDelete.isPending}
            >
              {bulkDelete.isPending && <Loader2 className="size-4 animate-spin" />}
              Delete {selected.size}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
