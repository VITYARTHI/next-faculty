import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { resourcesApi } from "./api";
import type {
  CreateResourceInput,
  ListResourcesParams,
  UpdateResourceInput,
} from "./types";

export const resourcesKeys = {
  all: ["resources"] as const,
  lists: () => [...resourcesKeys.all, "list"] as const,
  list: (params: ListResourcesParams) =>
    [...resourcesKeys.lists(), params] as const,
  detail: (id: number) => [...resourcesKeys.all, "detail", id] as const,
};

export function useResources(params: ListResourcesParams = {}) {
  return useQuery({
    queryKey: resourcesKeys.list(params),
    queryFn: () => resourcesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useResource(id: number) {
  return useQuery({
    queryKey: resourcesKeys.detail(id),
    queryFn: () => resourcesApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: resourcesKeys.all });
}

export function useCreateResource() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateResourceInput) => resourcesApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateResource(id: number) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: UpdateResourceInput) => resourcesApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteResource() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => resourcesApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useToggleResourceActive() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: number) => resourcesApi.toggleActive(id),
    onSuccess: invalidate,
  });
}

export function useBulkDeleteResources() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (ids: number[]) => resourcesApi.bulkDelete(ids),
    onSuccess: invalidate,
  });
}

export function useBulkToggleResources() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (ids: number[]) => resourcesApi.bulkToggleActive(ids),
    onSuccess: invalidate,
  });
}
