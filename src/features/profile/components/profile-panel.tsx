"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nameInitials } from "@/lib/format";
import { getErrorMessage } from "@/lib/api";
import {
  useDeletePhoto,
  useUpdateProfile,
  useUploadPhoto,
} from "../queries";
import type { ProfileResponse, UpdateProfileBody } from "../types";

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

interface Props {
  profile: ProfileResponse;
}

export function ProfilePanel({ profile }: Props) {
  const { user } = profile;
  const update = useUpdateProfile();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<UpdateProfileBody>({
    name: user.name ?? "",
    phone: user.phone ?? "",
    biography: user.biography ?? "",
    skills: user.skills ?? "",
    website: user.website ?? "",
    facebook: user.facebook ?? "",
    twitter: user.twitter ?? "",
    linkedin: user.linkedin ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof UpdateProfileBody>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.name.trim()) {
      setErrors({ name: "Name is required." });
      return;
    }
    setErrors({});
    try {
      const body: UpdateProfileBody = {
        name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
        biography: form.biography?.trim() || undefined,
        skills: form.skills?.trim() || undefined,
        website: form.website?.trim() || undefined,
        facebook: form.facebook?.trim() || undefined,
        twitter: form.twitter?.trim() || undefined,
        linkedin: form.linkedin?.trim() || undefined,
      };
      await update.mutateAsync(body);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update profile"));
    }
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("Photo must be 3 MB or smaller.");
      e.target.value = "";
      return;
    }
    try {
      await uploadPhoto.mutateAsync(file);
      toast.success("Photo updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload failed"));
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onPhotoDelete = async () => {
    try {
      await deletePhoto.mutateAsync();
      toast.success("Photo removed");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove photo"));
    }
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-6 py-4">
        <h3 className="text-base font-semibold">Profile</h3>
        <p className="text-xs text-muted-foreground">
          Update how you appear to students.
        </p>
      </div>

      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {user.photo_url && <AvatarImage src={user.photo_url} alt="" />}
            <AvatarFallback className="bg-primary/10 text-base font-medium text-primary">
              {nameInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onPhotoChange}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInput.current?.click()}
              disabled={uploadPhoto.isPending}
            >
              {uploadPhoto.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {user.photo_url ? "Change" : "Upload"}
            </Button>
            {user.photo_url && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onPhotoDelete}
                disabled={deletePhoto.isPending}
              >
                {deletePhoto.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Remove
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              JPG, PNG, or WebP — up to 3 MB.
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name} required>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name || undefined}
            />
          </Field>
          <Field label="Email">
            <Input value={user.email} disabled readOnly />
          </Field>
          <Field label="Phone">
            <Input
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Website">
            <Input
              type="url"
              value={form.website ?? ""}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://"
            />
          </Field>
          <Field label="LinkedIn">
            <Input
              type="url"
              value={form.linkedin ?? ""}
              onChange={(e) => set("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/…"
            />
          </Field>
          <Field label="Twitter / X">
            <Input
              type="url"
              value={form.twitter ?? ""}
              onChange={(e) => set("twitter", e.target.value)}
              placeholder="https://twitter.com/…"
            />
          </Field>
          <Field label="Facebook">
            <Input
              type="url"
              value={form.facebook ?? ""}
              onChange={(e) => set("facebook", e.target.value)}
              placeholder="https://facebook.com/…"
            />
          </Field>
        </div>

        <Field label="Biography">
          <Textarea
            rows={3}
            value={form.biography ?? ""}
            onChange={(e) => set("biography", e.target.value)}
            placeholder="A short bio shown to students."
          />
        </Field>

        <Field
          label="Skills"
          hint="Comma-separated. Visible on your faculty page."
        >
          <Input
            value={form.skills ?? ""}
            onChange={(e) => set("skills", e.target.value)}
            placeholder="Computer vision, ML, signal processing"
          />
        </Field>

        <div className="flex justify-end">
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
