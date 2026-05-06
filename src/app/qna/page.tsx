"use client";

import { PageShell } from "@/components/page-shell";
import { QnaTable } from "@/features/qna/components/qna-table";

export default function QnaPage() {
  return (
    <PageShell
      title="Questions"
      description="Student questions across all your slots."
    >
      <QnaTable />
    </PageShell>
  );
}
