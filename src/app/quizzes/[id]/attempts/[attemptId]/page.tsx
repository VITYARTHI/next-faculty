"use client";

import { use } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock,
  Flag,
  Hash,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { Pill } from "@/features/faculty/components/badges";
import { AttemptStatusBadge } from "@/features/quizzes/components/badges";
import { useQuizAttempt } from "@/features/quizzes/queries";
import { formatDateTime, nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  AttemptQuestion,
  AttemptViolation,
} from "@/features/quizzes/types";

export default function AttemptDetailPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id, attemptId } = use(params);
  const quizId = Number(id);
  const aId = Number(attemptId);
  const { data, isLoading, isError, error } = useQuizAttempt(quizId, aId);

  return (
    <PageShell
      title={data ? data.user.name : "Attempt"}
      description={
        data ? `Attempt #${data.attempt_number} · ${data.quiz.title}` : undefined
      }
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href={`/quizzes/${quizId}`}>
            <ArrowLeft className="size-4" /> Back to quiz
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
          {getErrorMessage(error, "Attempt not found")}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="size-12">
                  {data.user.photo && (
                    <AvatarImage src={data.user.photo} alt="" />
                  )}
                  <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                    {nameInitials(data.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {data.user.name}
                    </h2>
                    <AttemptStatusBadge
                      isCompleted={data.is_completed}
                      passed={data.passed}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {data.user.email}
                    </span>
                    {data.user.registration_number && (
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="size-3.5" />
                        {data.user.registration_number}
                      </span>
                    )}
                    {data.slot?.name && <span>{data.slot.name}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Score
                </div>
                <div className="text-3xl font-semibold tabular-nums">
                  {data.score != null ? data.score.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Pass ≥ {data.quiz.passing_score}%
                </div>
              </div>
            </div>

            <dl className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Correct">
                <span className="tabular-nums">
                  {data.correct_answers}/{data.total_questions}
                </span>
              </Field>
              <Field label="Time taken">
                <span className="tabular-nums">
                  {data.time_taken_formatted ?? "—"}
                </span>
              </Field>
              <Field label="Started">{formatDateTime(data.started_at)}</Field>
              <Field label="Submitted">
                {formatDateTime(data.submitted_at)}
              </Field>
            </dl>
          </div>

          {data.violations.length > 0 && (
            <ViolationsPanel violations={data.violations} />
          )}

          <QuestionsList questions={data.questions} />
        </div>
      )}
    </PageShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

const VIOLATION_LABELS: Record<string, string> = {
  tab_switch: "Tab switch",
  fullscreen_exit: "Fullscreen exit",
  copy_paste: "Copy / paste",
  right_click: "Right click",
  window_blur: "Window blur",
  dev_tools: "Dev tools opened",
};

function violationLabel(type: string): string {
  if (VIOLATION_LABELS[type]) return VIOLATION_LABELS[type];
  return type
    .split("_")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

function ViolationsPanel({ violations }: { violations: AttemptViolation[] }) {
  const totalEvents = violations.reduce((sum, v) => sum + v.violation_count, 0);
  return (
    <div className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20">
      <div className="flex items-center justify-between gap-2 border-b border-rose-200 px-5 py-3 dark:border-rose-900/60">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-rose-600" />
          <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">
            {violations.length} violation type
            {violations.length === 1 ? "" : "s"}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {totalEvents} total event{totalEvents === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="divide-y divide-rose-200/70 dark:divide-rose-900/60">
        {violations.map((v) => (
          <li
            key={v.id}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {violationLabel(v.violation_type)}
              </span>
              <Pill tone="rose">×{v.violation_count}</Pill>
            </div>
            <span className="text-xs text-muted-foreground">
              Last detected {formatDateTime(v.detected_at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuestionsList({ questions }: { questions: AttemptQuestion[] }) {
  if (questions.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        No questions recorded.
      </div>
    );
  }
  const ordered = [...questions].sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Questions & responses</h3>
      <div className="space-y-3">
        {ordered.map((q) => (
          <QuestionCard key={q.question.id} item={q} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ item }: { item: AttemptQuestion }) {
  const { order, question, response, is_answered } = item;
  const correct = toKeyArray(question.correct_option);
  const selected = toKeyArray(response?.selected_option ?? null);
  const optionEntries = question.options
    ? Object.entries(question.options)
    : [];

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Q{order}
            </span>
            {!is_answered ? (
              <Pill tone="zinc">Not answered</Pill>
            ) : response?.is_correct ? (
              <Pill tone="emerald">
                <Check className="size-3" />
                Correct
              </Pill>
            ) : (
              <Pill tone="rose">
                <X className="size-3" />
                Incorrect
              </Pill>
            )}
            {response?.marked_for_review && (
              <Pill tone="amber">
                <Flag className="size-3" />
                Marked for review
              </Pill>
            )}
            {question.points != null && (
              <span className="text-xs text-muted-foreground">
                {question.points} {question.points === 1 ? "point" : "points"}
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
            {question.question_text}
          </p>
        </div>
        {response?.time_spent_seconds != null && (
          <div className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {formatSeconds(response.time_spent_seconds)}
          </div>
        )}
      </div>

      {optionEntries.length > 0 ? (
        <ul className="divide-y">
          {optionEntries.map(([key, label]) => {
            const isCorrect = correct.includes(key);
            const isSelected = selected.includes(key);
            return (
              <li
                key={key}
                className={cn(
                  "flex items-start gap-3 px-5 py-3 text-sm",
                  isCorrect && "bg-emerald-50/50 dark:bg-emerald-950/20",
                  !isCorrect &&
                    isSelected &&
                    "bg-rose-50/50 dark:bg-rose-950/20",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium uppercase",
                    isCorrect
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isSelected
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-muted-foreground/40 text-muted-foreground",
                  )}
                >
                  {key}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {label}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-2 text-[11px]">
                    {isCorrect && (
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        Correct answer
                      </span>
                    )}
                    {isSelected && (
                      <span className="font-medium text-muted-foreground">
                        Student&apos;s answer
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-2 p-5 text-sm">
          <div>
            <span className="text-muted-foreground">Student&apos;s answer: </span>
            <span className="font-medium">
              {formatScalarOrList(response?.selected_option ?? null) || "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Correct answer: </span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              {formatScalarOrList(question.correct_option) || "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function toKeyArray(value: string | string[] | null): string[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function formatScalarOrList(value: string | string[] | null): string {
  if (value == null) return "";
  return Array.isArray(value) ? value.join(", ") : value;
}

function formatSeconds(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "0s";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
}
