import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseActionCard } from "@/lib/today-compass/validation";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const parsed = parseActionCard(await request.json());

  if (!parsed) {
    return NextResponse.json(
      { error: "Please complete every field with a valid value." },
      { status: 400 },
    );
  }

  const card = await prisma.actionCard.update({
    where: { id: params.id },
    data: parsed,
  });

  return NextResponse.json(card);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as { archived?: unknown };

  if (typeof body.archived !== "boolean") {
    return NextResponse.json(
      { error: "An archive state is required." },
      { status: 400 },
    );
  }

  const card = await prisma.actionCard.update({
    where: { id: params.id },
    data: { archivedAt: body.archived ? new Date() : null },
  });

  return NextResponse.json(card);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const sessionCount = await prisma.actionSession.count({
    where: { actionCardId: params.id },
  });

  if (sessionCount > 0) {
    return NextResponse.json(
      {
        error:
          "This card has completion history. Archive it instead so the history stays intact.",
      },
      { status: 409 },
    );
  }

  await prisma.actionCard.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
