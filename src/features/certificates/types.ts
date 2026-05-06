export type CertificateStatus = "generated" | "pending";
export type CertificateStatusFilter = CertificateStatus | "all";

export interface CertificateStudent {
  id: number;
  name: string;
  email: string;
  registration_number: string | null;
  photo: string | null;
}

export interface CertificateSlot {
  id: number;
  name: string;
}

export interface CertificateCourse {
  flipped_course_id: number;
  course_id: number;
  name: string;
}

export interface CertificateInfo {
  status: CertificateStatus;
  identifier: string | null;
  generated_at: string | null;
}

export interface CertificateRow {
  registration_id: number;
  student: CertificateStudent;
  slot: CertificateSlot;
  course: CertificateCourse;
  certificate: CertificateInfo;
}

export interface ListCertificatesParams {
  per_page?: number;
  page?: number;
  slot_id?: number;
  flipped_course_id?: number;
  status?: CertificateStatusFilter;
  search?: string;
}

export type ExportCertificatesParams = Omit<
  ListCertificatesParams,
  "page" | "per_page"
>;
