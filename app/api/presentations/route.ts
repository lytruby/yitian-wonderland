import { NextResponse } from "next/server";
import {
  createPresentation,
  listPresentations,
  toErrorResponse,
} from "@/lib/presentation-studio/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listPresentations());
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.title !== "string") {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    return NextResponse.json(
      await createPresentation({ title: body.title, coverText: body.coverText }),
      { status: 201 },
    );
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
