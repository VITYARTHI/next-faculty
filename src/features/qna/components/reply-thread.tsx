"use client";

import { useState } from "react";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pill } from "@/features/faculty/components/badges";
import { formatDateTime, nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  useCreateQnaReply,
  useDeleteQnaReply,
  useUpdateQnaReply,
} from "../queries";
import type { QnaReply } from "../types";

const MESSAGE_MAX = 5000;

interface Props {
  questionId: number;
  replies: QnaReply[];
  currentUserId: number | null;
  canReply: boolean;
}

export function ReplyThread({
  questionId,
  replies,
  currentUserId,
  canReply,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {replies.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
            No replies yet.
          </div>
        ) : (
          replies.map((reply) => (
            <ReplyCard
              key={reply.id}
              reply={reply}
              questionId={questionId}
              isOwn={currentUserId !== null && reply.user_id === currentUserId}
            />
          ))
        )}
      </div>

      {canReply && <ReplyComposer questionId={questionId} />}
    </div>
  );
}

function ReplyCard({
  reply,
  questionId,
  isOwn,
}: {
  reply: QnaReply;
  questionId: number;
  isOwn: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateReply = useUpdateQnaReply(questionId);
  const deleteReply = useDeleteQnaReply(questionId);

  const [draft, setDraft] = useState(reply.message);
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setDraft(reply.message);
    setError(null);
    setEditing(true);
  };

  const submitEdit = async () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) {
      setError("Reply cannot be empty.");
      return;
    }
    if (trimmed.length > MESSAGE_MAX) {
      setError(`Max ${MESSAGE_MAX} characters.`);
      return;
    }
    try {
      await updateReply.mutateAsync({
        replyId: reply.id,
        body: { message: trimmed },
      });
      toast.success("Reply updated");
      setEditing(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update reply"));
    }
  };

  const submitDelete = async () => {
    try {
      await deleteReply.mutateAsync(reply.id);
      toast.success("Reply deleted");
      setConfirmDelete(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete reply"));
    }
  };

  const isFaculty = reply.is_faculty_reply;
  const edited = reply.updated_at && reply.updated_at !== reply.created_at;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        isFaculty && "border-indigo-200 bg-indigo-50/30 dark:border-indigo-900/60 dark:bg-indigo-950/20",
      )}
    >
      <div className="flex items-start gap-3 px-5 py-4">
        <Avatar className="size-9">
          {reply.user.photo && <AvatarImage src={reply.user.photo} alt="" />}
          <AvatarFallback
            className={cn(
              "text-xs font-medium",
              isFaculty
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
                : "bg-primary/10 text-primary",
            )}
          >
            {nameInitials(reply.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {reply.user.name || "—"}
            </span>
            {isFaculty && <Pill tone="indigo">Faculty</Pill>}
            <span className="text-xs text-muted-foreground">
              {formatDateTime(reply.created_at)}
              {edited && <span className="ml-1">(edited)</span>}
            </span>
          </div>
          {!editing ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {reply.message}
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              <Textarea
                rows={4}
                value={draft}
                maxLength={MESSAGE_MAX}
                onChange={(e) => setDraft(e.target.value)}
                aria-invalid={Boolean(error) || undefined}
              />
              <div className="flex items-center justify-between text-xs">
                {error ? (
                  <span className="text-destructive">{error}</span>
                ) : (
                  <span className="text-muted-foreground">
                    Max {MESSAGE_MAX} characters.
                  </span>
                )}
                <span className="text-muted-foreground tabular-nums">
                  {draft.length}/{MESSAGE_MAX}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={updateReply.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={submitEdit}
                  disabled={updateReply.isPending}
                >
                  {updateReply.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {isOwn && !editing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Reply actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={startEditing}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setConfirmDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete reply?</DialogTitle>
            <DialogDescription>
              This permanently removes your reply from the thread. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleteReply.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitDelete}
              disabled={deleteReply.isPending}
            >
              {deleteReply.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReplyComposer({ questionId }: { questionId: number }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createReply = useCreateQnaReply(questionId);

  const submit = async () => {
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      setError("Reply cannot be empty.");
      return;
    }
    if (trimmed.length > MESSAGE_MAX) {
      setError(`Max ${MESSAGE_MAX} characters.`);
      return;
    }
    try {
      await createReply.mutateAsync({ message: trimmed });
      setMessage("");
      setError(null);
      toast.success("Reply posted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not post reply"));
    }
  };

  return (
    <div className="space-y-2 rounded-xl border bg-card p-5">
      <Label htmlFor="qna-reply">Reply as faculty</Label>
      <Textarea
        id="qna-reply"
        rows={4}
        value={message}
        maxLength={MESSAGE_MAX}
        placeholder="Write a reply…"
        onChange={(e) => setMessage(e.target.value)}
        aria-invalid={Boolean(error) || undefined}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : (
          <span className="text-muted-foreground">
            Posting marks this question as answered.
          </span>
        )}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground tabular-nums">
            {message.length}/{MESSAGE_MAX}
          </span>
          <Button
            size="sm"
            onClick={submit}
            disabled={createReply.isPending || message.trim().length === 0}
          >
            {createReply.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Post reply
          </Button>
        </div>
      </div>
    </div>
  );
}
