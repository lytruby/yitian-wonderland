import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as Record<string, unknown>;
  const title = clean(body.title, 200);
  const prompt = clean(body.prompt, 5000);
  const code = clean(body.code, 10000);
  const language = clean(body.language, 30);
  const answer = clean(body.answer, 5000);
  const explanation = clean(body.explanation, 5000);

  if (!title) {
    return NextResponse.json(
      { error: "A question title is required." },
      { status: 400 },
    );
  }

  const question = await prisma.interviewQuestion.create({
    data: {
      prepItemId: params.id,
      title,
      prompt: prompt || null,
      code: code || null,
      language: code ? language || "javascript" : null,
      answer,
      explanation: explanation || null,
    },
  });

  await prisma.prepItem.update({
    where: { id: params.id },
    data: { lastReviewedAt: new Date() },
  });

  return NextResponse.json(question, { status: 201 });
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
