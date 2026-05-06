import type { FlippedCourse } from "../faculty/types";

export interface ResourceSlot {
  id: number;
  name: string;
  flipped_course: FlippedCourse;
}

export interface Resource {
  id: number;
  title: string;
  description: string | null;
  file_url: string | null;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  file_size_formatted: string | null;
  file_extension: string | null;
  is_active: boolean;
  flipped_course_slot_id: number;
  flipped_course_slot: ResourceSlot;
  created_at?: string;
  updated_at?: string;
}

export interface ListResourcesParams {
  page?: number;
  per_page?: number;
  flipped_course_slot_id?: number;
  is_active?: boolean;
  search?: string;
}

export type ResourceMode = "upload" | "external";

export interface CreateResourceInput {
  flipped_course_slot_id: number;
  title: string;
  description?: string;
  is_active?: boolean;
  // Exactly one of these must be provided.
  file?: File;
  file_url?: string;
}

export interface UpdateResourceInput {
  flipped_course_slot_id?: number;
  title?: string;
  description?: string;
  is_active?: boolean;
  file?: File;
  file_url?: string;
  remove_file?: boolean;
}

export interface BulkDeleteResult {
  deleted: number;
  skipped: Array<{ id: number; reason: string }>;
}

export interface BulkToggleResult {
  toggled: number;
}
