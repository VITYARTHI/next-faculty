"use client";

import { PageShell } from "@/components/page-shell";
import { CertificatesTable } from "@/features/certificates/components/certificates-table";

export default function CertificatesPage() {
  return (
    <PageShell
      title="Certificates"
      description="Track certificate status for students across your slots."
    >
      <CertificatesTable />
    </PageShell>
  );
}
