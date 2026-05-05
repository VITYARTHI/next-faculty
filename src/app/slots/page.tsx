"use client";

import { PageShell } from "@/components/page-shell";
import { SlotsTable } from "@/features/faculty/components/slots-table";

export default function SlotsPage() {
  return (
    <PageShell
      title="Slots"
      description="All slots assigned to you across flipped courses."
    >
      <SlotsTable />
    </PageShell>
  );
}
