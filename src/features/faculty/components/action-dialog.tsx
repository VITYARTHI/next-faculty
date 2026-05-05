"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api";
import {
  useApproveRegistration,
  useBulkApprove,
  useBulkReject,
  useRejectRegistration,
} from "../queries";
import type { BulkSkipped } from "../types";

export type Action = "approve" | "reject";

interface SingleProps {
  mode: "single";
  action: Action;
  registrationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
}

interface BulkProps {
  mode: "bulk";
  action: Action;
  ids: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
}

type Props = SingleProps | BulkProps;

const NOTES_MAX = 1000;

export function RegistrationActionDialog(props: Props) {
  const { action, open, onOpenChange, onCompleted } = props;
  const isReject = action === "reject";
  const isBulk = props.mode === "bulk";
  const count = isBulk ? props.ids.length : 1;

  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setNotes("");
      setError(null);
    }
  }, [open]);

  const approveSingle = useApproveRegistration();
  const rejectSingle = useRejectRegistration();
  const bulkApprove = useBulkApprove();
  const bulkReject = useBulkReject();

  const isPending =
    approveSingle.isPending ||
    rejectSingle.isPending ||
    bulkApprove.isPending ||
    bulkReject.isPending;

  const submit = async () => {
    const trimmed = notes.trim();
    if (isReject && trimmed.length === 0) {
      setError("A reason is required to reject.");
      return;
    }
    if (trimmed.length > NOTES_MAX) {
      setError(`Notes must be ${NOTES_MAX} characters or fewer.`);
      return;
    }
    setError(null);

    try {
      if (props.mode === "single") {
        if (isReject) {
          await rejectSingle.mutateAsync({
            id: props.registrationId,
            body: { admin_notes: trimmed },
          });
        } else {
          await approveSingle.mutateAsync({
            id: props.registrationId,
            body: trimmed ? { admin_notes: trimmed } : undefined,
          });
        }
        toast.success(isReject ? "Registration rejected" : "Registration approved");
      } else {
        if (isReject) {
          const result = await bulkReject.mutateAsync({
            ids: props.ids,
            admin_notes: trimmed,
          });
          announceBulk("rejected", result.rejected, result.skipped);
        } else {
          const result = await bulkApprove.mutateAsync({
            ids: props.ids,
            admin_notes: trimmed || undefined,
          });
          announceBulk("approved", result.approved, result.skipped);
        }
      }
      onOpenChange(false);
      onCompleted?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Action failed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReject ? "Reject" : "Approve"}{" "}
            {isBulk ? `${count} registration${count === 1 ? "" : "s"}` : "registration"}
          </DialogTitle>
          <DialogDescription>
            {isReject
              ? "A note is required and will be saved with the registration. Rejecting an approved registration revokes it."
              : "Optionally add a note that will be saved with the registration."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="admin-notes">
            {isReject ? "Reason" : "Notes"}
            {isReject && <span className="ml-0.5 text-destructive">*</span>}
          </Label>
          <Textarea
            id="admin-notes"
            rows={4}
            value={notes}
            maxLength={NOTES_MAX}
            placeholder={
              isReject
                ? "Why is this being rejected?"
                : "Optional comments…"
            }
            onChange={(e) => setNotes(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
          />
          <div className="flex items-center justify-between text-xs">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-muted-foreground">
                {isReject ? "Required." : "Optional."} Max {NOTES_MAX} characters.
              </span>
            )}
            <span className="text-muted-foreground tabular-nums">
              {notes.length}/{NOTES_MAX}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={isReject ? "destructive" : "default"}
            onClick={submit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isReject ? "Reject" : "Approve"}
            {isBulk ? ` ${count}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function announceBulk(
  verb: "approved" | "rejected",
  done: number,
  skipped: BulkSkipped[],
) {
  const description = summarizeSkipped(skipped);
  if (done === 0 && skipped.length > 0) {
    toast.error(`Nothing ${verb}.`, { description });
    return;
  }
  if (skipped.length > 0) {
    toast.success(`${done} ${verb}.`, { description });
    return;
  }
  toast.success(`${done} ${verb}.`);
}

const reasonLabel: Record<BulkSkipped["reason"], string> = {
  not_found: "not found",
  not_owned: "not yours",
  not_pending: "wrong status",
  slot_full: "slot full",
};

function summarizeSkipped(skipped: BulkSkipped[]): string | undefined {
  if (skipped.length === 0) return undefined;
  const counts: Partial<Record<BulkSkipped["reason"], number>> = {};
  for (const s of skipped) counts[s.reason] = (counts[s.reason] ?? 0) + 1;
  const parts = Object.entries(counts).map(
    ([k, v]) => `${v} ${reasonLabel[k as BulkSkipped["reason"]]}`,
  );
  return `Skipped ${skipped.length}: ${parts.join(", ")}.`;
}
