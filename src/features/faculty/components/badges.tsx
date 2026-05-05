import { cn } from "@/lib/utils";
import type {
  LessonStatus,
  RegistrationStatus,
  SlotCapacityStatus,
} from "../types";

type Tone = "emerald" | "amber" | "rose" | "zinc" | "indigo";

const toneStyles: Record<Tone, string> = {
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-400/20",
  amber:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-400/20",
  rose:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-400/20",
  zinc:
    "bg-zinc-100 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-800/60 dark:text-zinc-300 dark:ring-zinc-400/20",
  indigo:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-400/20",
};

export function Pill({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const registrationTone: Record<RegistrationStatus, Tone> = {
  approved: "emerald",
  requested: "amber",
  rejected: "rose",
  cancelled: "zinc",
};

export function RegistrationStatusBadge({
  status,
}: {
  status: RegistrationStatus;
}) {
  return <Pill tone={registrationTone[status]}>{status}</Pill>;
}

const capacityTone: Record<SlotCapacityStatus, Tone> = {
  available: "emerald",
  limited: "amber",
  full: "rose",
};

export function CapacityBadge({ status }: { status: SlotCapacityStatus }) {
  return <Pill tone={capacityTone[status]}>{status}</Pill>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Pill tone={active ? "emerald" : "zinc"}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-zinc-400",
        )}
      />
      {active ? "Active" : "Inactive"}
    </Pill>
  );
}

const lessonTone: Record<LessonStatus, Tone> = {
  completed: "emerald",
  in_progress: "amber",
  not_started: "zinc",
};

const lessonLabel: Record<LessonStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  not_started: "Not started",
};

export function LessonStatusBadge({ status }: { status: LessonStatus }) {
  return (
    <Pill tone={lessonTone[status]} className="capitalize">
      {lessonLabel[status]}
    </Pill>
  );
}

export function ProgressBar({
  value,
  className,
}: {
  /** 0-100 */
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      <div
        className={cn(
          "h-full transition-all",
          pct === 100
            ? "bg-emerald-500"
            : pct > 0
              ? "bg-amber-500"
              : "bg-muted-foreground/30",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function UtilizationBar({
  approved,
  capacity,
  className,
}: {
  approved: number;
  capacity: number;
  className?: string;
}) {
  const pct = capacity ? Math.round((approved / capacity) * 100) : 0;
  return (
    <div className={cn("h-1 w-24 overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn(
          "h-full transition-all",
          pct >= 90
            ? "bg-rose-500"
            : pct >= 70
              ? "bg-amber-500"
              : "bg-emerald-500",
        )}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}
