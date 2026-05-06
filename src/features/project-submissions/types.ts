import type { FlippedCourse } from "../faculty/types";

export type ProjectSubmissionStatus = "submitted" | "graded" | "rejected";

export interface ProjectSubmissionUser {
  id: number;
  name: string;
  email: string;
  registration_number: string | null;
  photo: string | null;
}

export interface CourseProjectCourse {
  id: number;
  name: string;
}

export interface CourseProject {
  id: number;
  title: string;
  description: string | null;
  course_id: number;
  course?: CourseProjectCourse;
  flipped_course?: FlippedCourse;
}

export interface ProjectSubmission {
  id: number;
  user_id: number;
  course_project_id: number;
  status: ProjectSubmissionStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  // The detail endpoint may omit relations the list eager-loads; render
  // defensively at call sites.
  user?: ProjectSubmissionUser;
  course_project?: CourseProject;
}

export interface ProjectSubmissionFiles {
  has_readme: boolean;
  has_report: boolean;
  readme_path?: string | null;
  report_path?: string | null;
}

export interface AiEvaluation {
  // Backend returns decoded JSON — keep loose so we can render whatever shows up.
  [key: string]: unknown;
}

export interface ProjectSubmissionDetail extends ProjectSubmission {
  description: string | null;
  repo_link: string | null;
  files: ProjectSubmissionFiles;
  ai_evaluation: AiEvaluation | null;
}

export type SubmissionsSort = "newest" | "oldest";

export interface ListSubmissionsParams {
  page?: number;
  per_page?: number;
  status?: ProjectSubmissionStatus;
  slot_id?: number;
  course_project_id?: number;
  course_id?: number;
  search?: string;
  submitted_from?: string;
  submitted_until?: string;
  sort?: SubmissionsSort;
}

export interface GradeBody {
  score: number;
  feedback?: string;
}

export interface RejectSubmissionBody {
  feedback: string;
}
