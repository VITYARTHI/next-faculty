"use client";

import { useState } from "react";
import { Search, Download, Loader2, Award, Clock, ExternalLink } from "lucide-react";
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
import { Pill } from "@/features/faculty/components/badges";
import { useSlots } from "@/features/faculty/queries";
import { certificatesApi } from "../api";
import { useCertificates } from "../queries";
import type { CertificateStatus, CertificateStatusFilter } from "../types";

const STATUS_OPTIONS: { value: CertificateStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "generated", label: "Generated" },
  { value: "pending", label: "Pending" },
];

const CERTIFICATE_BASE_URL = process.env.NEXT_PUBLIC_CERTIFICATE_BASE_URL;

function CertificateLink({ identifier }: { identifier: string }) {
  if (!CERTIFICATE_BASE_URL) {
    return <span>{identifier}</span>;
  }
  const href = `${CERTIFICATE_BASE_URL.replace(/\/+$/, "")}/${encodeURIComponent(
    identifier,
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
      title="Open certificate in new tab"
    >
      {identifier}
      <ExternalLink className="size-3" />
    </a>
  );
}

function CertificateStatusBadge({ status }: { status: CertificateStatus }) {
  if (status === "generated") {
    return (
      <Pill tone="emerald">
        <Award className="size-3" />
        Generated
      </Pill>
    );
  }
  return (
    <Pill tone="amber">
      <Clock className="size-3" />
      Pending
    </Pill>
  );
}

export function CertificatesTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [status, setStatus] = useState<CertificateStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState<string>("all");
  const debouncedSearch = useDebouncedValue(search, 350);

  const slotsForFilter = useSlots({ per_page: 100 });

  const filteredSlotId = slotFilter === "all" ? undefined : Number(slotFilter);

  const { data, isLoading, isFetching, isError, error } = useCertificates({
    page,
    per_page: perPage,
    status,
    search: debouncedSearch || undefined,
    slot_id: filteredSlotId,
  });

  const onFilterChange = () => setPage(1);

  const [exporting, setExporting] = useState(false);
  const onExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await certificatesApi.export({
        status,
        search: debouncedSearch || undefined,
        slot_id: filteredSlotId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  const rows = data?.data ?? [];
  const totalCols = 6;

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
          onValueChange={(v: CertificateStatusFilter) => {
            setStatus(v);
            onFilterChange();
          }}
        >
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
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
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onExport}
            disabled={exporting}
            title="Export current view as CSV"
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Student</TableHead>
            <TableHead>Roll No.</TableHead>
            <TableHead>Slot / Course</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Certificate No.</TableHead>
            <TableHead>Generated</TableHead>
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
                {getErrorMessage(error, "Failed to load certificates")}
              </TableCell>
            </TableRow>
          ) : !rows.length ? (
            <TableRow>
              <TableCell colSpan={totalCols} className="h-24 text-center text-sm text-muted-foreground">
                No certificates found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.registration_id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {row.student.photo && (
                        <AvatarImage src={row.student.photo} alt="" />
                      )}
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {nameInitials(row.student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {row.student.name || "—"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {row.student.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {row.student.registration_number ?? "—"}
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <div className="truncate text-sm font-medium">
                    {row.slot?.name ?? "—"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {row.course?.name ?? ""}
                  </div>
                </TableCell>
                <TableCell>
                  <CertificateStatusBadge status={row.certificate.status} />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {row.certificate.identifier ? (
                    <CertificateLink identifier={row.certificate.identifier} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.certificate.generated_at
                    ? formatDateTime(row.certificate.generated_at)
                    : "—"}
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
