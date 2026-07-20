import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as Record<string, unknown>;
  const title = clean(body.title, 200);

  if (!title) {
    return NextResponse.json(
      { error: "A question title is required." },
      { status: 400 },
    );
  }

  const code = clean(body.code, 10000);
  const question = await prisma.interviewQuestion.update({
    where: { id: params.id },
    data: {
      title,
      prompt: clean(body.prompt, 5000) || null,
      code: code || null,
      language: code ? clean(body.language, 30) || "javascript" : null,
      answer: clean(body.answer, 5000),
      explanation: clean(body.explanation, 5000) || null,
    },
  });

  return NextResponse.json(question);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  await prisma.interviewQuestion.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
