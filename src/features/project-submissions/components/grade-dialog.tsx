"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api";
import { useGradeSubmission, useRejectSubmission } from "../queries";

const FEEDBACK_MAX = 5000;

export type GradeMode = "grade" | "reject";

interface Props {
  mode: GradeMode;
  submissionId: number;
  open: boolean;
  initialScore?: number | null;
  initialFeedback?: string | null;
  onOpenChange: (open: boolean) => void;
}

export function GradeDialog({
  mode,
  submissionId,
  open,
  initialScore,
  initialFeedback,
  onOpenChange,
}: Props) {
  const isReject = mode === "reject";
  const grade = useGradeSubmission(submissionId);
  const reject = useRejectSubmission(submissionId);

  // Parent mounts this conditionally on open, so initial state runs fresh.
  const [scoreInput, setScoreInput] = useState(
    initialScore != null && !isReject ? String(initialScore) : "",
  );
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [error, setError] = useState<string | null>(null);

  const isPending = grade.isPending || reject.isPending;

  const submit = async () => {
    const trimmedFeedback = feedback.trim();
    if (trimmedFeedback.length > FEEDBACK_MAX) {
      setError(`Feedback must be ${FEEDBACK_MAX} characters or fewer.`);
      return;
    }
    if (isReject) {
      if (trimmedFeedback.length === 0) {
        setError("A reason is required to reject.");
        return;
      }
      try {
        await reject.mutateAsync({ feedback: trimmedFeedback });
        toast.success("Submission rejected");
        onOpenChange(false);
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not reject submission"));
      }
      return;
    }

    const score = Number(scoreInput);
    if (!Number.isFinite(score) || scoreInput.trim() === "") {
      setError("Enter a score between 0 and 100.");
      return;
    }
    if (score < 0 || score > 100) {
      setError("Score must be between 0 and 100.");
      return;
    }
    setError(null);
    try {
      await grade.mutateAsync({
        score,
        feedback: trimmedFeedback || undefined,
      });
      toast.success("Submission graded");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not grade submission"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isReject ? "Reject submission" : "Grade submission"}
          </DialogTitle>
          <DialogDescription>
            {isReject
              ? "Provide a reason. The student will see this feedback."
              : "Score the submission from 0–100. Optional feedback is saved with the grade."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isReject && (
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                placeholder="0–100"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="feedback">
              Feedback
              {isReject && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            <Textarea
              id="feedback"
              rows={5}
              value={feedback}
              maxLength={FEEDBACK_MAX}
              placeholder={
                isReject
                  ? "Why is this being rejected?"
                  : "Optional feedback for the student…"
              }
              onChange={(e) => setFeedback(e.target.value)}
              aria-invalid={Boolean(error) || undefined}
            />
            <div className="flex items-center justify-between text-xs">
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                <span className="text-muted-foreground">
                  {isReject ? "Required." : "Optional."} Max {FEEDBACK_MAX} characters.
                </span>
              )}
              <span className="text-muted-foreground tabular-nums">
                {feedback.length}/{FEEDBACK_MAX}
              </span>
            </div>
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
            {isReject ? "Reject" : "Save grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
