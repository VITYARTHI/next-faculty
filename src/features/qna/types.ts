import type { FlippedCourse } from "../faculty/types";

export type QnaStatus = "pending" | "answered" | "closed";

export interface QnaUser {
  id: number;
  name: string;
  email: string;
  registration_number: string | null;
  photo: string | null;
}

export interface QnaReply {
  id: number;
  question_id: number;
  user_id: number;
  message: string;
  is_faculty_reply: boolean;
  created_at: string;
  updated_at: string;
  user: QnaUser;
}

export interface QnaQuestionSlot {
  id: number;
  name: string;
  flipped_course: FlippedCourse;
}

export interface QnaQuestion {
  id: number;
  user_id: number;
  flipped_course_slot_id: number;
  title: string;
  description: string;
  status: QnaStatus;
  created_at: string;
  updated_at: string;
  replies_count: number;
  user: QnaUser;
  flipped_course_slot: QnaQuestionSlot;
}

export interface QnaQuestionDetail extends QnaQuestion {
  replies: QnaReply[];
}

export type QnaSort = "newest" | "oldest";

export interface ListQnaParams {
  page?: number;
  per_page?: number;
  status?: QnaStatus;
  slot_id?: number;
  flipped_course_id?: number;
  search?: string;
  sort?: QnaSort;
}

export interface CreateReplyBody {
  message: string;
}

export interface UpdateReplyBody {
  message: string;
}
