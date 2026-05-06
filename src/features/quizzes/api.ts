import {
  api,
  unwrap,
  unwrapPage,
  type ApiEnvelope,
  type PaginatedEnvelope,
} from "@/lib/api";
import type {
  Attempt,
  AttemptDetail,
  ListAttemptsParams,
  ListQuizzesParams,
  Quiz,
  QuizDetail,
} from "./types";

export const quizzesApi = {
  list: (params: ListQuizzesParams = {}) =>
    api
      .get<PaginatedEnvelope<Quiz>>("/faculty/quizzes", { params })
      .then(unwrapPage),

  get: (id: number) =>
    api
      .get<ApiEnvelope<QuizDetail>>(`/faculty/quizzes/${id}`)
      .then(unwrap),

  listAttempts: (quizId: number, params: ListAttemptsParams = {}) =>
    api
      .get<PaginatedEnvelope<Attempt>>(
        `/faculty/quizzes/${quizId}/attempts`,
        { params },
      )
      .then(unwrapPage),

  getAttempt: (quizId: number, attemptId: number) =>
    api
      .get<ApiEnvelope<AttemptDetail>>(
        `/faculty/quizzes/${quizId}/attempts/${attemptId}`,
      )
      .then(unwrap),

  exportAttempts: async (
    quizId: number,
    params: Omit<ListAttemptsParams, "page" | "per_page" | "sort"> = {},
  ) => {
    const res = await api.get(
      `/faculty/quizzes/${quizId}/attempts/export`,
      { params, responseType: "blob" },
    );
    const cd = res.headers["content-disposition"] as string | undefined;
    const filename = parseFilename(cd) ?? "quiz_results.csv";
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
