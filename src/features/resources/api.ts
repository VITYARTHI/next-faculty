import {
  api,
  unwrap,
  unwrapPage,
  type ApiEnvelope,
  type PaginatedEnvelope,
} from "@/lib/api";
import type {
  BulkDeleteResult,
  BulkToggleResult,
  CreateResourceInput,
  ListResourcesParams,
  Resource,
  UpdateResourceInput,
} from "./types";

function buildFormData(
  input: CreateResourceInput | UpdateResourceInput,
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) {
      fd.append(key, value);
    } else if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

// The axios instance defaults to JSON Content-Type, which suppresses axios's
// FormData auto-detection. Setting it to undefined lets the browser fill in
// `multipart/form-data; boundary=…` correctly.
const MULTIPART_CONFIG = {
  headers: { "Content-Type": undefined as unknown as string },
};

export const resourcesApi = {
  list: (params: ListResourcesParams = {}) =>
    api
      .get<PaginatedEnvelope<Resource>>("/faculty/resources", { params })
      .then(unwrapPage),

  get: (id: number) =>
    api.get<ApiEnvelope<Resource>>(`/faculty/resources/${id}`).then(unwrap),

  create: (input: CreateResourceInput) =>
    api
      .post<ApiEnvelope<Resource>>(
        "/faculty/resources",
        buildFormData(input),
        MULTIPART_CONFIG,
      )
      .then(unwrap),

  update: (id: number, input: UpdateResourceInput) => {
    // Use POST + _method=PATCH so multipart bodies work without PHP's
    // PATCH-without-files quirks.
    const fd = buildFormData(input);
    fd.append("_method", "PATCH");
    return api
      .post<ApiEnvelope<Resource>>(
        `/faculty/resources/${id}`,
        fd,
        MULTIPART_CONFIG,
      )
      .then(unwrap);
  },

  remove: (id: number) =>
    api.delete<ApiEnvelope<null>>(`/faculty/resources/${id}`),

  toggleActive: (id: number) =>
    api
      .post<ApiEnvelope<Resource>>(`/faculty/resources/${id}/toggle-active`)
      .then(unwrap),

  bulkDelete: (ids: number[]) =>
    api
      .post<ApiEnvelope<BulkDeleteResult>>("/faculty/resources/bulk-delete", {
        ids,
      })
      .then(unwrap),

  bulkToggleActive: (ids: number[]) =>
    api
      .post<ApiEnvelope<BulkToggleResult>>(
        "/faculty/resources/bulk-toggle-active",
        { ids },
      )
      .then(unwrap),
};
