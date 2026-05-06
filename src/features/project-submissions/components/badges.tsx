import { Pill } from "@/features/faculty/components/badges";
import type { ProjectSubmissionStatus } from "../types";

const statusTone = {
  submitted: "amber",
  graded: "emerald",
  rejected: "rose",
} as const;

const statusLabel: Record<ProjectSubmissionStatus, string> = {
  submitted: "Submitted",
  graded: "Graded",
  rejected: "Rejected",
};

export function SubmissionStatusBadge({
  status,
}: {
  status: ProjectSubmissionStatus;
}) {
  return <Pill tone={statusTone[status]}>{statusLabel[status]}</Pill>;
}
