"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api";
import { facultyApi } from "../api";

interface ProgressReportButtonProps {
  slotId: number;
  approvedCount: number;
  /** Variant/size pass-through for placement in tables vs page headers. */
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  /** Compact label for tight rows; full label is used by default. */
  compact?: boolean;
  className?: string;
}

export function ProgressReportButton({
  slotId,
  approvedCount,
  variant = "outline",
  size = "sm",
  compact,
  className,
}: ProgressReportButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const noStudents = approvedCount === 0;

  const onClick = async () => {
    setDownloading(true);
    try {
      const { blob, filename } = await facultyApi.getSlotProgressReport(slotId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to download progress report"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      disabled={downloading || noStudents}
      title={
        noStudents
          ? "No approved students yet"
          : "Download per-lesson progress CSV"
      }
    >
      {downloading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {compact ? "Progress" : "Progress report"}
    </Button>
  );
}
