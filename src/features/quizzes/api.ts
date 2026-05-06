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
};
