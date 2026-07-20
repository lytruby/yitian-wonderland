import { NextResponse } from "next/server";
import { createScene, toErrorResponse } from "@/lib/presentation-studio/storage";

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    if (typeof body.title !== "string") {
      return NextResponse.json({ error: "Scene title is required." }, { status: 400 });
    }
    return NextResponse.json(await createScene(params.slug, body.title), { status: 201 });
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
