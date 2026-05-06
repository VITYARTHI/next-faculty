import {
  api,
  unwrap,
  unwrapPage,
  type ApiEnvelope,
  type PaginatedEnvelope,
} from "@/lib/api";
import type {
  CreateReplyBody,
  ListQnaParams,
  QnaQuestion,
  QnaQuestionDetail,
  QnaReply,
  UpdateReplyBody,
} from "./types";

export const qnaApi = {
  list: (params: ListQnaParams = {}) =>
    api
      .get<PaginatedEnvelope<QnaQuestion>>("/faculty/qna", { params })
      .then(unwrapPage),

  get: (id: number) =>
    api
      .get<ApiEnvelope<QnaQuestionDetail>>(`/faculty/qna/${id}`)
      .then(unwrap),

  createReply: (id: number, body: CreateReplyBody) =>
    api
      .post<ApiEnvelope<QnaReply>>(`/faculty/qna/${id}/replies`, body)
      .then(unwrap),

  updateReply: (id: number, replyId: number, body: UpdateReplyBody) =>
    api
      .patch<ApiEnvelope<QnaReply>>(
        `/faculty/qna/${id}/replies/${replyId}`,
        body,
      )
      .then(unwrap),

  deleteReply: (id: number, replyId: number) =>
    api.delete<ApiEnvelope<null>>(`/faculty/qna/${id}/replies/${replyId}`),

  markAnswered: (id: number) =>
    api
      .post<ApiEnvelope<QnaQuestionDetail>>(`/faculty/qna/${id}/mark-answered`)
      .then(unwrap),

  markClosed: (id: number) =>
    api
      .post<ApiEnvelope<QnaQuestionDetail>>(`/faculty/qna/${id}/mark-closed`)
      .then(unwrap),
};
