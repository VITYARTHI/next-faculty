"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ListChecks,
  Loader2,
  PercentCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/page-shell";
import { useRegistrationProgress } from "@/features/faculty/queries";
import {
  LessonStatusBadge,
  ProgressBar,
  RegistrationStatusBadge,
} from "@/features/faculty/components/badges";
import { formatDateTime, nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  ProgressLesson,
  ProgressSection,
  ProgressSummary,
  StudentProgress,
} from "@/features/faculty/types";

export default function ProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const registrationId = Number(id);
  const { data, isLoading, isError, error } = useRegistrationProgress(registrationId);

  return (
    <PageShell
      title={data ? data.student.name : "Student progress"}
      description={
        data ? `${data.course.name} · ${data.slot.name}` : undefined
      }
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link href={`/registrations/${registrationId}`}>
            <ArrowLeft className="size-4" /> Registration
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
          {getErrorMessage(error, "Progress not found")}
        </div>
      ) : (
        <div className="space-y-6">
          <StudentHeader data={data} />
          <SummaryGrid summary={data.summary} />
          <SectionsList sections={data.sections} />
        </div>
      )}
    </PageShell>
  );
}

function StudentHeader({ data }: { data: StudentProgress }) {
  const { student, registration, summary, slot, course } = data;
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-14">
            {student.photo && <AvatarImage src={student.photo} alt="" />}
            <AvatarFallback className="bg-primary/10 text-base font-medium text-primary">
              {nameInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {student.name}
              </h2>
              <RegistrationStatusBadge status={registration.status} />
            </div>
            <div className="text-sm text-muted-foreground">{student.email}</div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {student.registration_number && (
                <span>Roll {student.registration_number}</span>
              )}
              <Link
                href={`/slots/${slot.id}`}
                className="font-medium text-foreground hover:underline"
              >
                {slot.name}
              </Link>
              <span>{course.name}</span>
            </div>
          </div>
        </div>
        <div className="min-w-[220px] space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Overall progress
          </div>
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-3xl font-semibold">
              {summary.completion_percentage}%
            </span>
            <span className="text-sm text-muted-foreground">
              {summary.completed_lessons}/{summary.total_lessons} lessons
            </span>
          </div>
          <ProgressBar value={summary.completion_percentage} />
          {summary.last_activity && (
            <div className="text-xs text-muted-foreground">
              Last activity {formatDateTime(summary.last_activity)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const summaryToneStyles = {
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-500",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
} as const;

type SummaryTone = keyof typeof summaryToneStyles;

function SummaryGrid({ summary }: { summary: ProgressSummary }) {
  const cards: Array<{
    label: string;
    value: string | number;
    hint?: string;
    icon: React.ReactNode;
    tone: SummaryTone;
  }> = [
    {
      label: "Sections",
      value: summary.total_sections,
      icon: <Layers className="size-5" />,
      tone: "indigo",
    },
    {
      label: "Lessons",
      value: summary.total_lessons,
      hint: `${summary.in_progress_lessons} in progress · ${summary.not_started_lessons} not started`,
      icon: <BookOpen className="size-5" />,
      tone: "zinc",
    },
    {
      label: "Completed",
      value: summary.completed_lessons,
      hint: `${summary.completion_percentage}%`,
      icon: <CheckCircle2 className="size-5" />,
      tone: "emerald",
    },
    {
      label: "Time spent",
      value: summary.total_time_spent_formatted || "—",
      hint:
        summary.total_lessons > 0
          ? `${formatSeconds(Math.round(summary.average_time_per_lesson))} avg / lesson`
          : undefined,
      icon: <Clock className="size-5" />,
      tone: "amber",
    },
    {
      label: "Completion",
      value: `${summary.completion_percentage}%`,
      icon: <PercentCircle className="size-5" />,
      tone: "indigo",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            <div className={cn("rounded-lg p-2.5", summaryToneStyles[c.tone])}>
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionsList({ sections }: { sections: ProgressSection[] }) {
  if (sections.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        <ListChecks className="mx-auto mb-2 size-6 opacity-50" />
        No sections in this course yet.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {sections
        .slice()
        .sort((a, b) => a.section_sort - b.section_sort)
        .map((section) => (
          <SectionCard key={section.section_id} section={section} />
        ))}
    </div>
  );
}

function SectionCard({ section }: { section: ProgressSection }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">{section.section_title}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {section.completed_lessons}/{section.total_lessons} lessons
            </span>
            <span>·</span>
            <span>{section.total_time_spent_formatted || "0s"} watched</span>
          </div>
        </div>
        <div className="min-w-[200px] space-y-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums">
              {section.completion_percentage}%
            </span>
          </div>
          <ProgressBar value={section.completion_percentage} />
        </div>
      </div>
      <ul className="divide-y">
        {section.lessons
          .slice()
          .sort((a, b) => a.sort - b.sort)
          .map((lesson) => (
            <LessonRow key={lesson.lesson_id} lesson={lesson} />
          ))}
      </ul>
    </div>
  );
}

function LessonRow({ lesson }: { lesson: ProgressLesson }) {
  return (
    <li className="grid grid-cols-1 items-center gap-3 px-5 py-3 sm:grid-cols-[minmax(0,1fr)_140px_180px_140px]">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <LessonStatusBadge status={lesson.status} />
          <span className="truncate text-sm font-medium">{lesson.title}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Duration {lesson.duration}
          {lesson.watched_segments_count > 0 && (
            <> · {lesson.watched_segments_count} segments</>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">Watched</span>
          <span className="font-medium tabular-nums">
            {lesson.progress_percentage}%
          </span>
        </div>
        <ProgressBar value={lesson.progress_percentage} />
      </div>
      <div className="text-xs text-muted-foreground">
        <div>
          <span className="text-foreground tabular-nums">
            {lesson.time_spent_formatted || "0s"}
          </span>{" "}
          spent
        </div>
        {lesson.current_position > 0 && lesson.status !== "completed" && (
          <div className="tabular-nums">
            at {lesson.current_position_formatted}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {lesson.last_accessed_formatted ?? "Never accessed"}
      </div>
    </li>
  );
}

function formatSeconds(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "0s";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts: string[] = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (sec || parts.length === 0) parts.push(`${sec}s`);
  return parts.join(" ");
}
