import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.actionSession.findMany({
    where: { status: "completed" },
    include: {
      actionCard: {
        select: { id: true, title: true, thread: true },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 100,
  });

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    actionCardId?: unknown;
    completeWithoutTimer?: unknown;
    completedOn?: unknown;
  };

  if (typeof body.actionCardId !== "string") {
    return NextResponse.json(
      { error: "An action card is required." },
      { status: 400 },
    );
  }

  const action = await prisma.actionCard.findUnique({
    where: { id: body.actionCardId },
  });

  if (!action) {
    return NextResponse.json(
      { error: "That action card no longer exists." },
      { status: 404 },
    );
  }

  let completedAt: Date | undefined;
  if (body.completeWithoutTimer === true && body.completedOn !== undefined) {
    if (
      typeof body.completedOn !== "string" ||
      !isValidDateKey(body.completedOn) ||
      body.completedOn > singaporeDateKey(new Date())
    ) {
      return NextResponse.json(
        { error: "Choose a valid completion date that is not in the future." },
        { status: 400 },
      );
    }
    completedAt = new Date(`${body.completedOn}T12:00:00+08:00`);
  }

  const session = await prisma.actionSession.create({
    data: {
      actionCardId: action.id,
      plannedMinutes: action.minutes,
      ...(body.completeWithoutTimer === true
        ? { status: "completed", completedAt: completedAt ?? new Date() }
        : {}),
    },
  });

  return NextResponse.json(session, { status: 201 });
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00+08:00`);
  return !Number.isNaN(date.getTime()) && singaporeDateKey(date) === value;
}

function singaporeDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}
