import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  PrepPriority,
  PrepStatus,
} from "@/lib/interview-prep/types";

const statuses: PrepStatus[] = [
  "untouched",
  "need_review",
  "can_explain",
  "can_demonstrate",
];
const priorities: PrepPriority[] = ["normal", "important", "focus"];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as {
    status?: unknown;
    priority?: unknown;
    notes?: unknown;
    markReviewed?: unknown;
  };
  const data: {
    status?: PrepStatus;
    priority?: PrepPriority;
    notes?: string;
    lastReviewedAt?: Date;
  } = {};

  if (body.status !== undefined) {
    if (!statuses.includes(body.status as PrepStatus)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    data.status = body.status as PrepStatus;
    data.lastReviewedAt = new Date();
  }

  if (body.priority !== undefined) {
    if (!priorities.includes(body.priority as PrepPriority)) {
      return NextResponse.json(
        { error: "Invalid priority." },
        { status: 400 },
      );
    }
    data.priority = body.priority as PrepPriority;
  }

  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") {
      return NextResponse.json({ error: "Invalid notes." }, { status: 400 });
    }
    data.notes = body.notes.trim().slice(0, 5000);
  }

  if (body.markReviewed === true) {
    data.lastReviewedAt = new Date();
  }

  const item = await prisma.prepItem.update({
    where: { id: params.id },
    data,
    include: { evidence: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json(item);
}
