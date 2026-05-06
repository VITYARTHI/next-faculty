import {
  api,
  unwrap,
  unwrapPage,
  type ApiEnvelope,
  type PaginatedEnvelope,
} from "@/lib/api";
import type {
  GradeBody,
  ListSubmissionsParams,
  ProjectSubmission,
  ProjectSubmissionDetail,
  RejectSubmissionBody,
} from "./types";

export const projectSubmissionsApi = {
  list: (params: ListSubmissionsParams = {}) =>
    api
      .get<PaginatedEnvelope<ProjectSubmission>>(
        "/faculty/project-submissions",
        { params },
      )
      .then(unwrapPage),

  get: (id: number) =>
    api
      .get<ApiEnvelope<ProjectSubmissionDetail>>(
        `/faculty/project-submissions/${id}`,
      )
      .then(unwrap),

  grade: (id: number, body: GradeBody) =>
    api
      .post<ApiEnvelope<ProjectSubmissionDetail>>(
        `/faculty/project-submissions/${id}/grade`,
        body,
      )
      .then(unwrap),

  reject: (id: number, body: RejectSubmissionBody) =>
    api
      .post<ApiEnvelope<ProjectSubmissionDetail>>(
        `/faculty/project-submissions/${id}/reject`,
        body,
      )
      .then(unwrap),
};
