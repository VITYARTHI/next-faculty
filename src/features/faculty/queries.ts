import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { facultyApi } from "./api";
import type {
  ApproveBody,
  BulkApproveBody,
  BulkRejectBody,
  ListRegistrationsParams,
  ListSlotsParams,
  RejectBody,
} from "./types";

export const facultyKeys = {
  all: ["faculty"] as const,
  stats: () => [...facultyKeys.all, "stats"] as const,
  slots: () => [...facultyKeys.all, "slots"] as const,
  slotsList: (params: ListSlotsParams) =>
    [...facultyKeys.slots(), "list", params] as const,
  slot: (id: number) => [...facultyKeys.slots(), "detail", id] as const,
  slotRegistrations: (id: number, params: Omit<ListRegistrationsParams, "slot_id">) =>
    [...facultyKeys.slot(id), "registrations", params] as const,
  registrations: () => [...facultyKeys.all, "registrations"] as const,
  registrationsList: (params: ListRegistrationsParams) =>
    [...facultyKeys.registrations(), "list", params] as const,
  registration: (id: number) =>
    [...facultyKeys.registrations(), "detail", id] as const,
  registrationProgress: (id: number) =>
    [...facultyKeys.registration(id), "progress"] as const,
};

export function useFacultyStats() {
  return useQuery({
    queryKey: facultyKeys.stats(),
    queryFn: facultyApi.stats,
  });
}

export function useSlots(
  params: ListSlotsParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: facultyKeys.slotsList(params),
    queryFn: () => facultyApi.listSlots(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

export function useSlot(slotId: number) {
  return useQuery({
    queryKey: facultyKeys.slot(slotId),
    queryFn: () => facultyApi.getSlot(slotId),
    enabled: Number.isFinite(slotId) && slotId > 0,
  });
}

export function useSlotRegistrations(
  slotId: number,
  params: Omit<ListRegistrationsParams, "slot_id"> = {},
) {
  return useQuery({
    queryKey: facultyKeys.slotRegistrations(slotId, params),
    queryFn: () => facultyApi.listSlotRegistrations(slotId, params),
    enabled: Number.isFinite(slotId) && slotId > 0,
    placeholderData: keepPreviousData,
  });
}

export function useRegistrations(params: ListRegistrationsParams = {}) {
  return useQuery({
    queryKey: facultyKeys.registrationsList(params),
    queryFn: () => facultyApi.listRegistrations(params),
    placeholderData: keepPreviousData,
  });
}

export function useRegistration(registrationId: number) {
  return useQuery({
    queryKey: facultyKeys.registration(registrationId),
    queryFn: () => facultyApi.getRegistration(registrationId),
    enabled: Number.isFinite(registrationId) && registrationId > 0,
  });
}

export function useRegistrationProgress(registrationId: number) {
  return useQuery({
    queryKey: facultyKeys.registrationProgress(registrationId),
    queryFn: () => facultyApi.getRegistrationProgress(registrationId),
    enabled: Number.isFinite(registrationId) && registrationId > 0,
  });
}

// Any approve/reject changes registration counts, slot capacity, and stats.
// Invalidate the whole faculty namespace — cheap and avoids stale dashboards.
function useInvalidateFaculty() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: facultyKeys.all });
}

export function useApproveRegistration() {
  const invalidate = useInvalidateFaculty();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body?: ApproveBody }) =>
      facultyApi.approveRegistration(id, body ?? {}),
    onSuccess: invalidate,
  });
}

export function useRejectRegistration() {
  const invalidate = useInvalidateFaculty();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: RejectBody }) =>
      facultyApi.rejectRegistration(id, body),
    onSuccess: invalidate,
  });
}

export function useBulkApprove() {
  const invalidate = useInvalidateFaculty();
  return useMutation({
    mutationFn: (body: BulkApproveBody) => facultyApi.bulkApprove(body),
    onSuccess: invalidate,
  });
}

export function useBulkReject() {
  const invalidate = useInvalidateFaculty();
  return useMutation({
    mutationFn: (body: BulkRejectBody) => facultyApi.bulkReject(body),
    onSuccess: invalidate,
  });
}
