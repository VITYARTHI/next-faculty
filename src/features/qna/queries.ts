import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { qnaApi } from "./api";
import type {
  CreateReplyBody,
  ListQnaParams,
  UpdateReplyBody,
} from "./types";

export const qnaKeys = {
  all: ["qna"] as const,
  lists: () => [...qnaKeys.all, "list"] as const,
  list: (params: ListQnaParams) => [...qnaKeys.lists(), params] as const,
  detail: (id: number) => [...qnaKeys.all, "detail", id] as const,
};

export function useQnaList(params: ListQnaParams = {}) {
  return useQuery({
    queryKey: qnaKeys.list(params),
    queryFn: () => qnaApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useQnaQuestion(id: number) {
  return useQuery({
    queryKey: qnaKeys.detail(id),
    queryFn: () => qnaApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

function useInvalidateQna() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: qnaKeys.all });
}

export function useCreateQnaReply(id: number) {
  const invalidate = useInvalidateQna();
  return useMutation({
    mutationFn: (body: CreateReplyBody) => qnaApi.createReply(id, body),
    onSuccess: invalidate,
  });
}

export function useUpdateQnaReply(id: number) {
  const invalidate = useInvalidateQna();
  return useMutation({
    mutationFn: ({
      replyId,
      body,
    }: {
      replyId: number;
      body: UpdateReplyBody;
    }) => qnaApi.updateReply(id, replyId, body),
    onSuccess: invalidate,
  });
}

export function useDeleteQnaReply(id: number) {
  const invalidate = useInvalidateQna();
  return useMutation({
    mutationFn: (replyId: number) => qnaApi.deleteReply(id, replyId),
    onSuccess: invalidate,
  });
}

export function useMarkQnaAnswered(id: number) {
  const invalidate = useInvalidateQna();
  return useMutation({
    mutationFn: () => qnaApi.markAnswered(id),
    onSuccess: invalidate,
  });
}

export function useMarkQnaClosed(id: number) {
  const invalidate = useInvalidateQna();
  return useMutation({
    mutationFn: () => qnaApi.markClosed(id),
    onSuccess: invalidate,
  });
}
