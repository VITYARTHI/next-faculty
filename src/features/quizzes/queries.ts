import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { quizzesApi } from "./api";
import type { ListAttemptsParams, ListQuizzesParams } from "./types";

export const quizzesKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizzesKeys.all, "list"] as const,
  list: (params: ListQuizzesParams) => [...quizzesKeys.lists(), params] as const,
  detail: (id: number) => [...quizzesKeys.all, "detail", id] as const,
  attempts: (quizId: number) =>
    [...quizzesKeys.detail(quizId), "attempts"] as const,
  attemptsList: (quizId: number, params: ListAttemptsParams) =>
    [...quizzesKeys.attempts(quizId), "list", params] as const,
  attempt: (quizId: number, attemptId: number) =>
    [...quizzesKeys.attempts(quizId), "detail", attemptId] as const,
};

export function useQuizzes(params: ListQuizzesParams = {}) {
  return useQuery({
    queryKey: quizzesKeys.list(params),
    queryFn: () => quizzesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useQuiz(id: number) {
  return useQuery({
    queryKey: quizzesKeys.detail(id),
    queryFn: () => quizzesApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useQuizAttempts(
  quizId: number,
  params: ListAttemptsParams = {},
) {
  return useQuery({
    queryKey: quizzesKeys.attemptsList(quizId, params),
    queryFn: () => quizzesApi.listAttempts(quizId, params),
    enabled: Number.isFinite(quizId) && quizId > 0,
    placeholderData: keepPreviousData,
  });
}

export function useQuizAttempt(quizId: number, attemptId: number) {
  return useQuery({
    queryKey: quizzesKeys.attempt(quizId, attemptId),
    queryFn: () => quizzesApi.getAttempt(quizId, attemptId),
    enabled:
      Number.isFinite(quizId) &&
      quizId > 0 &&
      Number.isFinite(attemptId) &&
      attemptId > 0,
  });
}
