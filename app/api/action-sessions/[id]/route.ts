import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SessionStatus } from "@/lib/today-compass/types";

const statuses: SessionStatus[] = [
  "running",
  "paused",
  "completed",
  "abandoned",
];

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const session = await prisma.actionSession.findUnique({
    where: { id: params.id },
  });

  if (!session) {
    return NextResponse.json(
      { error: "That completion record no longer exists." },
      { status: 404 },
    );
  }

  await prisma.actionSession.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as {
    status?: unknown;
    elapsedSeconds?: unknown;
    note?: unknown;
  };
  const status = body.status as SessionStatus;
  const elapsedSeconds = Number(body.elapsedSeconds);
  const note =
    typeof body.note === "string" ? body.note.trim().slice(0, 2000) : undefined;

  if (
    !statuses.includes(status) ||
    !Number.isInteger(elapsedSeconds) ||
    elapsedSeconds < 0
  ) {
    return NextResponse.json(
      { error: "Invalid session update." },
      { status: 400 },
    );
  }

  const current = await prisma.actionSession.findUnique({
    where: { id: params.id },
    select: { completedAt: true },
  });

  if (!current) {
    return NextResponse.json(
      { error: "That session no longer exists." },
      { status: 404 },
    );
  }

  const isFinished = status === "completed" || status === "abandoned";
  const session = await prisma.actionSession.update({
    where: { id: params.id },
    data: {
      status,
      elapsedSeconds,
      ...(note !== undefined ? { note: note || null } : {}),
      completedAt: isFinished ? (current.completedAt ?? new Date()) : null,
    },
  });

  return NextResponse.json(session);
}
