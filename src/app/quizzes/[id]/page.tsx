"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { ActiveBadge } from "@/features/faculty/components/badges";
import { AttemptsTable } from "@/features/quizzes/components/attempts-table";
import { useQuiz } from "@/features/quizzes/queries";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { QuizStats } from "@/features/quizzes/types";

export default function QuizDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const quizId = Number(id);
  const { data, isLoading, isError, error } = useQuiz(quizId);

  return (
    <PageShell
      title={data ? data.title : "Quiz"}
      description={
        data ? (
          <span className="inline-flex items-center gap-2">
            Pass ≥ {data.passing_score}%
            <ActiveBadge active={data.is_active} />
          </span>
        ) : undefined
      }
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href="/quizzes">
            <ArrowLeft className="size-4" /> All quizzes
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-destructive">
          {getErrorMessage(error, "Quiz not found")}
        </div>
      ) : (
        <div className="space-y-6">
          {data.description && (
            <div className="rounded-xl border bg-card p-5 text-sm leading-relaxed">
              {data.description}
            </div>
          )}
          <StatsGrid stats={data.stats} />
          <AttemptsTable quizId={data.id} />
        </div>
      )}
    </PageShell>
  );
}

const toneStyles = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500",
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
} as const;

type Tone = keyof typeof toneStyles;

function StatsGrid({ stats }: { stats: QuizStats }) {
  const cards: Array<{
    label: string;
    value: string | number;
    hint?: string;
    icon: React.ReactNode;
    tone: Tone;
  }> = [
    {
      label: "Attempts",
      value: stats.attempts_count,
      hint: `${stats.unique_students} students`,
      icon: <Users className="size-5" />,
      tone: "indigo",
    },
    {
      label: "Completed",
      value: stats.completed_count,
      hint: `${stats.in_progress_count} in progress`,
      icon: <CheckCircle2 className="size-5" />,
      tone: "emerald",
    },
    {
      label: "Passed",
      value: stats.passed_count,
      icon: <Target className="size-5" />,
      tone: "emerald",
    },
    {
      label: "Failed",
      value: stats.failed_count,
      icon: <XCircle className="size-5" />,
      tone: "rose",
    },
    {
      label: "In progress",
      value: stats.in_progress_count,
      icon: <PlayCircle className="size-5" />,
      tone: "amber",
    },
    {
      label: "Avg score",
      value: stats.avg_score != null ? stats.avg_score.toFixed(1) : "—",
      icon: <Target className="size-5" />,
      tone: "zinc",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-muted-foreground">
                {c.label}
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {c.value}
              </div>
              {c.hint && (
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {c.hint}
                </div>
              )}
            </div>
            <div className={cn("rounded-lg p-2.5", toneStyles[c.tone])}>
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
