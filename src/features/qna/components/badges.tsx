import { Pill } from "@/features/faculty/components/badges";
import type { QnaStatus } from "../types";

const statusTone = {
  pending: "amber",
  answered: "emerald",
  closed: "zinc",
} as const;

const statusLabel: Record<QnaStatus, string> = {
  pending: "Pending",
  answered: "Answered",
  closed: "Closed",
};

export function QnaStatusBadge({ status }: { status: QnaStatus }) {
  return <Pill tone={statusTone[status]}>{statusLabel[status]}</Pill>;
}
