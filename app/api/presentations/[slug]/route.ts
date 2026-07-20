import { NextResponse } from "next/server";
import {
  getPresentation,
  toErrorResponse,
  updatePresentation,
} from "@/lib/presentation-studio/storage";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    return NextResponse.json(await getPresentation(params.slug));
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    if (
      typeof body.title !== "string" ||
      typeof body.coverText !== "string" ||
      typeof body.script !== "string" ||
      !Array.isArray(body.scenes)
    ) {
      return NextResponse.json({ error: "Invalid presentation." }, { status: 400 });
    }
    return NextResponse.json(await updatePresentation(params.slug, body));
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
