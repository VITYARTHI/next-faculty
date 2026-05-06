import type { FlippedCourse } from "../faculty/types";

export interface QuizUser {
  id: number;
  name: string;
  email: string;
  registration_number: string | null;
  photo: string | null;
}

export interface QuizSlot {
  id: number;
  name: string;
}

// ---- Quizzes -------------------------------------------------------------

export interface QuizBase {
  id: number;
  title: string;
  description: string | null;
  passing_score: number;
  is_active: boolean;
  duration_minutes?: number | null;
  flipped_course_id: number;
  created_at?: string;
  updated_at?: string;
  flipped_course?: FlippedCourse;
}

export interface Quiz extends QuizBase {
  questions_count: number;
  attempts_count: number;
  completed_count: number;
  avg_score: number | null;
}

export interface QuizStats {
  attempts_count: number;
  completed_count: number;
  in_progress_count: number;
  passed_count: number;
  failed_count: number;
  unique_students: number;
  avg_score: number | null;
}

export interface QuizDetail extends QuizBase {
  stats: QuizStats;
}

export interface ListQuizzesParams {
  page?: number;
  per_page?: number;
  flipped_course_id?: number;
  is_active?: boolean;
  search?: string;
}

// ---- Attempts ------------------------------------------------------------

export type AttemptStatus = "completed" | "in_progress" | "passed" | "failed";
export type AttemptSort = "newest" | "oldest" | "score_desc" | "score_asc";

export interface Attempt {
  id: number;
  attempt_number: number;
  is_completed: boolean;
  score: number | null;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  time_taken_seconds: number | null;
  time_taken_formatted: string | null;
  violations_total: number;
  started_at: string | null;
  submitted_at: string | null;
  user: QuizUser;
  slot: QuizSlot | null;
}

export interface ListAttemptsParams {
  page?: number;
  per_page?: number;
  slot_id?: number;
  status?: AttemptStatus;
  has_violations?: boolean;
  started_from?: string;
  started_until?: string;
  search?: string;
  sort?: AttemptSort;
}

// ---- Attempt detail ------------------------------------------------------

export type QuestionType = "mcq" | "msq" | "true_false" | "short_answer";

export interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: QuestionType | string;
  options: Record<string, string> | null;
  correct_option: string | string[] | null;
  points?: number | null;
}

export interface QuestionResponse {
  id: number;
  selected_option: string | string[] | null;
  is_correct: boolean;
  time_spent_seconds: number | null;
  marked_for_review: boolean;
}

export interface AttemptQuestion {
  order: number;
  question: QuizQuestion;
  response: QuestionResponse | null;
  is_answered: boolean;
}

export interface AttemptViolation {
  id: number;
  attempt_id: number;
  violation_type: string;
  violation_count: number;
  detected_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AttemptDetail extends Attempt {
  quiz: {
    id: number;
    title: string;
    passing_score: number;
    duration_minutes?: number | null;
    [key: string]: unknown;
  };
  questions: AttemptQuestion[];
  violations: AttemptViolation[];
}
