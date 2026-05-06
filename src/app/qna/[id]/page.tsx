"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Hash,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import { QnaStatusBadge } from "@/features/qna/components/badges";
import { ReplyThread } from "@/features/qna/components/reply-thread";
import {
  useMarkQnaAnswered,
  useMarkQnaClosed,
  useQnaQuestion,
} from "@/features/qna/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { formatDateTime, nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";

export default function QnaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const questionId = Number(id);
  const { data: question, isLoading, isError, error } = useQnaQuestion(questionId);
  const { data: currentUser } = useCurrentUser();

  const markAnswered = useMarkQnaAnswered(questionId);
  const markClosed = useMarkQnaClosed(questionId);

  const onMarkAnswered = async () => {
    try {
      await markAnswered.mutateAsync();
      toast.success("Marked as answered");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    }
  };

  const onMarkClosed = async () => {
    try {
      await markClosed.mutateAsync();
      toast.success("Question closed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update status"));
    }
  };

  const canReply = question?.status !== "closed";
  const canMarkAnswered =
    question?.status === "pending" || question?.status === "closed";
  const canMarkClosed = question?.status !== "closed";

  return (
    <PageShell
      title={question ? question.title : "Question"}
      description={question ? `#${question.id}` : undefined}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/qna">
              <ArrowLeft className="size-4" /> All questions
            </Link>
          </Button>
          {question && canMarkAnswered && (
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkAnswered}
              disabled={markAnswered.isPending}
            >
              {markAnswered.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Mark answered
            </Button>
          )}
          {question && canMarkClosed && (
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkClosed}
              disabled={markClosed.isPending}
            >
              {markClosed.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              Close
            </Button>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !question ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-destructive">
          {getErrorMessage(error, "Question not found")}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-start">
                <Avatar className="size-12">
                  {question.user.photo && (
                    <AvatarImage src={question.user.photo} alt="" />
                  )}
                  <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                    {nameInitials(question.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {question.user.name || "—"}
                    </h2>
                    <QnaStatusBadge status={question.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {question.user.email}
                    </span>
                    {question.user.registration_number && (
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="size-3.5" />
                        {question.user.registration_number}
                      </span>
                    )}
                    <span>Asked {formatDateTime(question.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-6">
                <h3 className="text-base font-semibold">{question.title}</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {question.description}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MessageCircle className="size-4" />
                {question.replies.length}{" "}
                {question.replies.length === 1 ? "reply" : "replies"}
              </div>
              <ReplyThread
                questionId={question.id}
                replies={question.replies}
                currentUserId={currentUser?.id ?? null}
                canReply={canReply}
              />
              {!canReply && (
                <div className="rounded-xl border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
                  This question is closed. Mark it as answered to reply again.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border bg-card">
              <div className="border-b px-5 py-4">
                <h3 className="text-base font-semibold">Slot</h3>
              </div>
              <div className="space-y-3 p-5 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Name
                  </div>
                  <Link
                    href={`/slots/${question.flipped_course_slot.id}`}
                    className="mt-1 block font-medium underline-offset-4 hover:underline"
                  >
                    {question.flipped_course_slot.name}
                  </Link>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Course
                  </div>
                  <div className="mt-1">
                    {question.flipped_course_slot.flipped_course?.name ?? "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
