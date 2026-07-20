import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseActionCard } from "@/lib/today-compass/validation";

export async function GET() {
  const cards = await prisma.actionCard.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = parseActionCard(body);

  if (!parsed) {
    return NextResponse.json(
      { error: "Please complete every field with a valid value." },
      { status: 400 },
    );
  }

  const card = await prisma.actionCard.create({ data: parsed });
  return NextResponse.json(card, { status: 201 });
}
