import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as {
    title?: unknown;
    url?: unknown;
    note?: unknown;
  };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!title) {
    return NextResponse.json(
      { error: "A question is required." },
      { status: 400 },
    );
  }

  if (url && !/^https?:\/\//.test(url)) {
    return NextResponse.json(
      { error: "Evidence links must start with http:// or https://." },
      { status: 400 },
    );
  }

  const evidence = await prisma.prepEvidence.create({
    data: {
      prepItemId: params.id,
      title: title.slice(0, 200),
      url: url ? url.slice(0, 1000) : null,
      note: note ? note.slice(0, 5000) : null,
    },
  });

  await prisma.prepItem.update({
    where: { id: params.id },
    data: { lastReviewedAt: new Date() },
  });

  return NextResponse.json(evidence, { status: 201 });
}
