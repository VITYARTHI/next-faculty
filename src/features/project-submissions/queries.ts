import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { projectSubmissionsApi } from "./api";
import type {
  GradeBody,
  ListSubmissionsParams,
  RejectSubmissionBody,
} from "./types";

export const submissionsKeys = {
  all: ["project-submissions"] as const,
  lists: () => [...submissionsKeys.all, "list"] as const,
  list: (params: ListSubmissionsParams) =>
    [...submissionsKeys.lists(), params] as const,
  detail: (id: number) => [...submissionsKeys.all, "detail", id] as const,
};

export function useSubmissionsList(params: ListSubmissionsParams = {}) {
  return useQuery({
    queryKey: submissionsKeys.list(params),
    queryFn: () => projectSubmissionsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSubmission(id: number) {
  return useQuery({
    queryKey: submissionsKeys.detail(id),
    queryFn: () => projectSubmissionsApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: submissionsKeys.all });
}

export function useGradeSubmission(id: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: GradeBody) => projectSubmissionsApi.grade(id, body),
    onSuccess: invalidate,
  });
}

export function useRejectSubmission(id: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: RejectSubmissionBody) =>
      projectSubmissionsApi.reject(id, body),
    onSuccess: invalidate,
  });
}
