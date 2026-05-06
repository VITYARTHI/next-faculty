"use client";

import { PageShell } from "@/components/page-shell";
import { SubmissionsTable } from "@/features/project-submissions/components/submissions-table";

export default function ProjectSubmissionsPage() {
  return (
    <PageShell
      title="Project submissions"
      description="Student project submissions across all your slots."
    >
      <SubmissionsTable />
    </PageShell>
  );
}
