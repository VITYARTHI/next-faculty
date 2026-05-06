"use client";

import { useState } from "react";
import { ExternalLink, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSlots } from "@/features/faculty/queries";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCreateResource, useUpdateResource } from "../queries";
import type {
  CreateResourceInput,
  Resource,
  ResourceMode,
  UpdateResourceInput,
} from "../types";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.mov";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: Resource | null;
}

export function ResourceFormDialog({ open, onOpenChange, resource }: Props) {
  const isEdit = !!resource;
  const slots = useSlots({ per_page: 100 });
  const create = useCreateResource();
  const update = useUpdateResource(resource?.id ?? 0);

  const [title, setTitle] = useState(resource?.title ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [slotId, setSlotId] = useState<string>(
    resource?.flipped_course_slot_id
      ? String(resource.flipped_course_slot_id)
      : "",
  );
  const [isActive, setIsActive] = useState(resource?.is_active ?? true);
  const [mode, setMode] = useState<ResourceMode>(
    resource?.file_path ? "upload" : "external",
  );
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState(
    resource && !resource.file_path ? (resource.file_url ?? "") : "",
  );
  const [removeFile, setRemoveFile] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isPending = create.isPending || update.isPending;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_FILE_BYTES) {
      setErrors((prev) => ({ ...prev, file: "File must be 50 MB or smaller." }));
      e.target.value = "";
      return;
    }
    setFile(f);
    setErrors((prev) => {
      const { file: _, ...rest } = prev;
      return rest;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!slotId) next.slot = "Choose a slot.";

    if (!isEdit) {
      // Create requires exactly one of file or file_url.
      if (mode === "upload" && !file) next.file = "Upload a file.";
      if (mode === "external" && !externalUrl.trim())
        next.external = "Enter a URL.";
    } else {
      // Edit: switching modes requires the new value.
      if (mode === "external" && externalUrl.trim() === "" && !resource?.file_url)
        next.external = "Enter a URL or upload a file.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    try {
      if (isEdit && resource) {
        const input: UpdateResourceInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          flipped_course_slot_id: Number(slotId),
          is_active: isActive,
        };
        if (mode === "upload" && file) input.file = file;
        if (mode === "external" && externalUrl.trim())
          input.file_url = externalUrl.trim();
        if (removeFile) input.remove_file = true;
        await update.mutateAsync(input);
        toast.success("Resource updated");
      } else {
        const input: CreateResourceInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          flipped_course_slot_id: Number(slotId),
          is_active: isActive,
        };
        if (mode === "upload" && file) input.file = file;
        if (mode === "external") input.file_url = externalUrl.trim();
        await create.mutateAsync(input);
        toast.success("Resource created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save resource"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {isEdit ? "Edit resource" : "New resource"}
          </DialogTitle>
          <DialogDescription>
            Share course materials with students enrolled in a slot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={!!errors.title || undefined}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot">Slot</Label>
              <Select value={slotId} onValueChange={setSlotId}>
                <SelectTrigger
                  id="slot"
                  aria-invalid={!!errors.slot || undefined}
                  className="w-full [&>span]:truncate"
                >
                  <SelectValue placeholder="Choose slot…" />
                </SelectTrigger>
                <SelectContent>
                  {slots.data?.data.map((slot) => (
                    <SelectItem key={slot.id} value={String(slot.id)}>
                      <span className="font-medium">{slot.name}</span>
                      {slot.flipped_course?.name && (
                        <span className="ml-2 text-muted-foreground">
                          · {slot.flipped_course.name}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.slot && (
                <p className="text-xs text-destructive">{errors.slot}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this resource about?"
            />
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Tabs value={mode} onValueChange={(v) => setMode(v as ResourceMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload file</TabsTrigger>
                <TabsTrigger value="external">External URL</TabsTrigger>
              </TabsList>
            </Tabs>

            {mode === "upload" ? (
              <div className="space-y-2">
                {isEdit && resource?.file_path && !file && (
                  <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 p-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        {(resource.download_url ?? resource.file_url) ? (
                          <a
                            href={
                              (resource.download_url ??
                                resource.file_url) as string
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate font-medium underline-offset-4 hover:underline"
                          >
                            {resource.file_path.split("/").pop() ??
                              "Current file"}
                          </a>
                        ) : (
                          <div className="truncate font-medium">
                            {resource.file_path.split("/").pop() ??
                              "Current file"}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {resource.file_size_formatted ?? ""}
                          {resource.file_extension && (
                            <span className="uppercase">
                              {resource.file_size_formatted ? " · " : ""}
                              {resource.file_extension}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Checkbox
                        checked={removeFile}
                        onCheckedChange={(v) => setRemoveFile(Boolean(v))}
                      />
                      Remove
                    </label>
                  </div>
                )}
                <label
                  htmlFor="file"
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-center text-sm transition-colors hover:bg-muted/40",
                    isEdit && resource?.file_path && !file ? "p-3" : "p-5",
                    errors.file && "border-destructive",
                  )}
                >
                  <Upload className="size-4 text-muted-foreground" />
                  {file ? (
                    <>
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">
                        {isEdit ? "Replace file" : "Choose a file"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PDF, Office, images, video, archives — up to 50 MB
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="file"
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={onFileChange}
                />
                {errors.file && (
                  <p className="text-xs text-destructive">{errors.file}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {isEdit &&
                  !resource?.file_path &&
                  (resource?.download_url ?? resource?.file_url) && (
                    <a
                      href={
                        (resource?.download_url ?? resource?.file_url) as string
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 break-all text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      {resource?.download_url ?? resource?.file_url}
                    </a>
                  )}
                <Input
                  id="file_url"
                  type="url"
                  placeholder="https://example.com/notes.pdf"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  aria-invalid={!!errors.external || undefined}
                />
                {errors.external && (
                  <p className="text-xs text-destructive">{errors.external}</p>
                )}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isActive}
              onCheckedChange={(v) => setIsActive(Boolean(v))}
            />
            Visible to students
          </label>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
