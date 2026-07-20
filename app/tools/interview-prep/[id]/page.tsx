import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  KnowledgeDetail,
  type InterviewQuestionRecord,
  type KnowledgeItemRecord,
} from "@/components/interview-prep/KnowledgeDetail";
import { prisma } from "@/lib/prisma";
import type { PrepStatus } from "@/lib/interview-prep/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const item = await prisma.prepItem.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: item?.title ?? "Interview Prep" };
}

export default async function KnowledgeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await prisma.prepItem.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { createdAt: "desc" } } },
  });
  if (!item) notFound();

  const initialItem: KnowledgeItemRecord = {
    id: item.id,
    track: item.track,
    section: item.section,
    title: item.title,
    notes: item.notes,
    status: item.status as PrepStatus,
    sourceUrl: item.sourceUrl,
    lastReviewedAt: item.lastReviewedAt?.toISOString() ?? null,
  };
  const initialQuestions: InterviewQuestionRecord[] = item.questions.map(
    (question) => ({
      id: question.id,
      title: question.title,
      prompt: question.prompt,
      code: question.code,
      language: question.language,
      answer: question.answer,
      explanation: question.explanation,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    }),
  );

  return (
    <div className="page-shell max-w-6xl">
      <div className="pb-8 pt-14 md:pt-20">
        <Link
          href="/tools/interview-prep"
          className="text-xs uppercase tracking-[0.2em] text-moss transition hover:text-ink"
        >
          ← Interview Prep
        </Link>
      </div>
      <KnowledgeDetail
        initialItem={initialItem}
        initialQuestions={initialQuestions}
      />
    </div>
  );
}
