"use client";

import { PageShell } from "@/components/page-shell";
import { RegistrationsTable } from "@/features/faculty/components/registrations-table";

export default function RegistrationsPage() {
  return (
    <PageShell
      title="Registrations"
      description="Student registrations across all your slots."
    >
      <RegistrationsTable />
    </PageShell>
  );
}
