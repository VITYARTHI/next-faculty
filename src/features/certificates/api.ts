import { api, unwrapPage, type PaginatedEnvelope } from "@/lib/api";
import type {
  CertificateRow,
  ExportCertificatesParams,
  ListCertificatesParams,
} from "./types";

export const certificatesApi = {
  list: (params: ListCertificatesParams = {}) =>
    api
      .get<PaginatedEnvelope<CertificateRow>>("/faculty/certificates", { params })
      .then(unwrapPage),

  export: async (params: ExportCertificatesParams = {}) => {
    const res = await api.get("/faculty/certificates/export", {
      params,
      responseType: "blob",
    });
    const cd = res.headers["content-disposition"] as string | undefined;
    const filename = parseFilename(cd) ?? "certificates.csv";
    return { blob: res.data as Blob, filename };
  },
};

function parseFilename(contentDisposition: string | undefined): string | null {
  if (!contentDisposition) return null;
  const match =
    /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition) ??
    /filename="?([^";]+)"?/i.exec(contentDisposition);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
