import { Pill } from "@/features/faculty/components/badges";

export function AttemptStatusBadge({
  isCompleted,
  passed,
}: {
  isCompleted: boolean;
  passed: boolean;
}) {
  if (!isCompleted) return <Pill tone="amber">In progress</Pill>;
  if (passed) return <Pill tone="emerald">Passed</Pill>;
  return <Pill tone="rose">Failed</Pill>;
}

export function ViolationsPill({ count }: { count: number }) {
  if (count === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return <Pill tone="rose">{count}</Pill>;
}
