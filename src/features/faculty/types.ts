// Types mirror the Faculty API spec (APIDETAILS.txt §3).

export interface FlippedCourse {
  id: number;
  name: string;
  course_id: number;
}

export interface FlippedCourseFaculty {
  id: number;
  // Backend may include user/course refs; keep loose for forward-compat.
  [key: string]: unknown;
}

export type SlotCapacityStatus = "available" | "limited" | "full";

export interface Slot {
  id: number;
  name: string;
  flipped_course_id: number;
  flipped_course_faculty_id: number;
  capacity: number;
  is_active: boolean;
  registration_deadline: string | null;
  description: string | null;
  requested_count: number;
  approved_count: number;
  rejected_count: number;
  flipped_course: FlippedCourse;
}

export interface SlotDetail extends Slot {
  available_capacity: number;
  capacity_status: SlotCapacityStatus;
  is_registration_open: boolean;
  flipped_course_faculty: FlippedCourseFaculty;
}

export type RegistrationStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "cancelled";

export interface RegistrationUser {
  id: number;
  name: string;
  email: string;
  registration_number: string | null;
  photo: string | null;
}

export interface Registration {
  id: number;
  flipped_course_slot_id: number;
  user_id: number;
  status: RegistrationStatus;
  registered_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  approved_by: { id: number; name: string } | null;
  admin_notes: string | null;
  student_notes: string | null;
  user: RegistrationUser;
  flipped_course_slot: {
    id: number;
    name: string;
    flipped_course: FlippedCourse;
  };
}

// ---- Dashboard stats -----------------------------------------------------

export interface FacultyStatsTotals {
  total_slots: number;
  active_slots: number;
  total_capacity: number;
  available_capacity: number;
  approved_students: number;
  pending_requests: number;
  rejected_requests: number;
}

export interface FacultyStatsSlot {
  id: number;
  name: string;
  is_active: boolean;
  capacity: number;
  approved_count: number;
  requested_count: number;
  rejected_count: number;
  available_capacity: number;
  flipped_course: FlippedCourse;
}

export interface FacultyStats {
  faculty: { id: number; name: string; email: string };
  totals: FacultyStatsTotals;
  slots: FacultyStatsSlot[];
}

// ---- Mutations -----------------------------------------------------------

export type BulkSkipReason =
  | "not_found"
  | "not_owned"
  | "not_pending"
  | "slot_full";

export interface BulkSkipped {
  id: number;
  reason: BulkSkipReason;
}

export interface BulkApproveResult {
  approved: number;
  skipped: BulkSkipped[];
}

export interface BulkRejectResult {
  rejected: number;
  skipped: BulkSkipped[];
}

export interface ApproveBody {
  admin_notes?: string;
}

export interface RejectBody {
  admin_notes: string;
}

export interface BulkApproveBody {
  ids: number[];
  admin_notes?: string;
}

export interface BulkRejectBody {
  ids: number[];
  admin_notes: string;
}

// ---- Query param shapes --------------------------------------------------

export interface ListSlotsParams {
  per_page?: number;
  is_active?: boolean;
  search?: string;
  page?: number;
}

export interface ListRegistrationsParams {
  per_page?: number;
  page?: number;
  slot_id?: number;
  flipped_course_id?: number;
  status?: RegistrationStatus;
  search?: string;
  approved_from?: string; // YYYY-MM-DD
  approved_until?: string; // YYYY-MM-DD
}
