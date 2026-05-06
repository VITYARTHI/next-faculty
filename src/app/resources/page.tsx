"use client";

import { PageShell } from "@/components/page-shell";
import { ResourcesTable } from "@/features/resources/components/resources-table";

export default function ResourcesPage() {
  return (
    <PageShell
      title="Resources"
      description="Course materials shared with students enrolled in your slots."
    >
      <ResourcesTable />
    </PageShell>
  );
}
