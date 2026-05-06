"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Download,
  ExternalLink,
  FileText,
  Hash,
  Loader2,
  Mail,
  Sparkles,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { useSubmission } from "@/features/project-submissions/queries";
import { SubmissionStatusBadge } from "@/features/project-submissions/components/badges";
import {
  GradeDialog,
  type GradeMode,
} from "@/features/project-submissions/components/grade-dialog";
import { formatDateTime, nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";

type DownloadKind = "readme" | "report";

function downloadHref(submissionId: number, kind: DownloadKind): string {
  return `/api/v1/faculty/project-submissions/${submissionId}/download-${kind}`;
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const submissionId = Number(id);
  const { data, isLoading, isError, error } = useSubmission(submissionId);
  const [dialog, setDialog] = useState<GradeMode | null>(null);

  const canGrade = data?.status === "submitted" || data?.status === "graded";
  const canReject = data?.status === "submitted";
  const isGraded = data?.status === "graded";

  return (
    <PageShell
      title={data ? data.course_project?.title || "Submission" : "Submission"}
      description={data ? `#${data.id}` : undefined}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/project-submissions">
              <ArrowLeft className="size-4" /> All submissions
            </Link>
          </Button>
          {data && canGrade && (
            <Button size="sm" onClick={() => setDialog("grade")}>
              <Award className="size-4" />
              {isGraded ? "Re-grade" : "Grade"}
            </Button>
          )}
          {data && canReject && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDialog("reject")}
            >
              <X className="size-4" />
              Reject
            </Button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-destructive">
          {getErrorMessage(error, "Submission not found")}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-start">
                <Avatar className="size-12">
                  {data.user?.photo && <AvatarImage src={data.user.photo} alt="" />}
                  <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                    {nameInitials(data.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {data.user?.name || "—"}
                    </h2>
                    <SubmissionStatusBadge status={data.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {data.user?.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        {data.user.email}
                      </span>
                    )}
                    {data.user?.registration_number && (
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="size-3.5" />
                        {data.user.registration_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <dl className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
                <Field label="Project">
                  {data.course_project?.title ?? "—"}
                </Field>
                <Field label="Submitted">
                  {formatDateTime(data.submitted_at)}
                </Field>
                <Field label="Graded">
                  {formatDateTime(data.graded_at)}
                </Field>
                <Field label="Score">
                  {data.score != null ? (
                    <span className="text-base font-semibold tabular-nums">
                      {data.score}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        / 100
                      </span>
                    </span>
                  ) : (
                    "—"
                  )}
                </Field>
                <Field label="Repository">
                  {data.repo_link ? (
                    <a
                      href={data.repo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all underline-offset-4 hover:underline"
                    >
                      {data.repo_link}
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  ) : (
                    "—"
                  )}
                </Field>
              </dl>
            </div>

            {data.description && (
              <Section title="Description">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {data.description}
                </p>
              </Section>
            )}

            {data.feedback && (
              <Section title="Faculty feedback">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {data.feedback}
                </p>
              </Section>
            )}

            {data.ai_evaluation && (
              <Section
                title="AI evaluation"
                icon={<Sparkles className="size-4 text-indigo-500" />}
              >
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs leading-relaxed">
                  {JSON.stringify(data.ai_evaluation, null, 2)}
                </pre>
              </Section>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold">Files</h3>
                <p className="text-xs text-muted-foreground">
                  Downloads are audit-logged.
                </p>
              </div>
              <div className="space-y-2 p-5">
                <FileRow
                  label="README"
                  available={data.files.has_readme}
                  href={downloadHref(data.id, "readme")}
                />
                <FileRow
                  label="Report"
                  available={data.files.has_report}
                  href={downloadHref(data.id, "report")}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {dialog && data && (
        <GradeDialog
          mode={dialog}
          submissionId={data.id}
          open
          initialScore={data.score}
          initialFeedback={data.feedback}
          onOpenChange={(open) => !open && setDialog(null)}
        />
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

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        {icon}
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FileRow({
  label,
  available,
  href,
}: {
  label: string;
  available: boolean;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div className="flex items-center gap-3">
        <FileText className="size-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">
            {available ? "Available" : "Not provided"}
          </div>
        </div>
      </div>
      {available ? (
        <Button asChild size="sm" variant="outline">
          <a href={href} download>
            <Download className="size-4" />
            Download
          </a>
        </Button>
      ) : (
        <Button size="sm" variant="outline" disabled>
          <Download className="size-4" />
          Download
        </Button>
      )}
    </div>
  );
}
