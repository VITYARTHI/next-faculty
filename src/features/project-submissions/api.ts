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

  exportSubmissions: async (
    params: Omit<ListSubmissionsParams, "page" | "per_page" | "sort"> = {},
  ) => {
    const res = await api.get("/faculty/project-submissions/export", {
      params,
      responseType: "blob",
    });
    const cd = res.headers["content-disposition"] as string | undefined;
    const filename = parseFilename(cd) ?? "project_submissions.csv";
    return { blob: res.data as Blob, filename };
  },
};

function parseFilename(contentDisposition: string | undefined): string | null {
  if (!contentDisposition) return null;
  const match =
    /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition) ??
    /filename="?([^";]+)"?/i.exec(contentDisposition);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
