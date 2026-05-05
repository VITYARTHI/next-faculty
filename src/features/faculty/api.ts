import {
  api,
  unwrap,
  unwrapPage,
  type ApiEnvelope,
  type PaginatedEnvelope,
} from "@/lib/api";
import type {
  ApproveBody,
  BulkApproveBody,
  BulkApproveResult,
  BulkRejectBody,
  BulkRejectResult,
  FacultyStats,
  ListRegistrationsParams,
  ListSlotsParams,
  RejectBody,
  Registration,
  Slot,
  SlotDetail,
  StudentProgress,
} from "./types";

export const facultyApi = {
  stats: () =>
    api.get<ApiEnvelope<FacultyStats>>("/faculty/stats").then(unwrap),

  listSlots: (params: ListSlotsParams = {}) =>
    api
      .get<PaginatedEnvelope<Slot>>("/faculty/slots", { params })
      .then(unwrapPage),

  getSlot: (slotId: number) =>
    api
      .get<ApiEnvelope<SlotDetail>>(`/faculty/slots/${slotId}`)
      .then(unwrap),

  listSlotRegistrations: (
    slotId: number,
    params: Omit<ListRegistrationsParams, "slot_id"> = {},
  ) =>
    api
      .get<PaginatedEnvelope<Registration>>(
        `/faculty/slots/${slotId}/registrations`,
        { params },
      )
      .then(unwrapPage),

  listRegistrations: (params: ListRegistrationsParams = {}) =>
    api
      .get<PaginatedEnvelope<Registration>>("/faculty/registrations", { params })
      .then(unwrapPage),

  getRegistration: (registrationId: number) =>
    api
      .get<ApiEnvelope<Registration>>(`/faculty/registrations/${registrationId}`)
      .then(unwrap),

  getRegistrationProgress: (registrationId: number) =>
    api
      .get<ApiEnvelope<StudentProgress>>(
        `/faculty/registrations/${registrationId}/progress`,
      )
      .then(unwrap),

  approveRegistration: (id: number, body: ApproveBody = {}) =>
    api
      .post<ApiEnvelope<Registration>>(
        `/faculty/registrations/${id}/approve`,
        body,
      )
      .then(unwrap),

  rejectRegistration: (id: number, body: RejectBody) =>
    api
      .post<ApiEnvelope<Registration>>(
        `/faculty/registrations/${id}/reject`,
        body,
      )
      .then(unwrap),

  bulkApprove: (body: BulkApproveBody) =>
    api
      .post<ApiEnvelope<BulkApproveResult>>(
        `/faculty/registrations/bulk-approve`,
        body,
      )
      .then(unwrap),

  bulkReject: (body: BulkRejectBody) =>
    api
      .post<ApiEnvelope<BulkRejectResult>>(
        `/faculty/registrations/bulk-reject`,
        body,
      )
      .then(unwrap),
};
