"use client";

import { PageShell } from "@/components/page-shell";
import { QuizzesTable } from "@/features/quizzes/components/quizzes-table";

export default function QuizzesPage() {
  return (
    <PageShell
      title="Quizzes"
      description="Quiz attempts across your approved students."
    >
      <QuizzesTable />
    </PageShell>
  );
}
