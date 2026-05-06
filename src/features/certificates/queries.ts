import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { certificatesApi } from "./api";
import type { ListCertificatesParams } from "./types";

export const certificateKeys = {
  all: ["certificates"] as const,
  list: (params: ListCertificatesParams) =>
    [...certificateKeys.all, "list", params] as const,
};

export function useCertificates(params: ListCertificatesParams = {}) {
  return useQuery({
    queryKey: certificateKeys.list(params),
    queryFn: () => certificatesApi.list(params),
    placeholderData: keepPreviousData,
  });
}
