import { NextResponse } from "next/server";
import {
  deleteScene,
  getSceneHtml,
  toErrorResponse,
  updateSceneHtml,
} from "@/lib/presentation-studio/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: { slug: string; sceneId: string } },
) {
  try {
    const html = await getSceneHtml(params.slug, params.sceneId);
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { slug: string; sceneId: string } },
) {
  try {
    await deleteScene(params.slug, params.sceneId);
    return new Response(null, { status: 204 });
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string; sceneId: string } },
) {
  try {
    const body = await request.json();
    if (typeof body.html !== "string") {
      return NextResponse.json({ error: "HTML is required." }, { status: 400 });
    }
    await updateSceneHtml(params.slug, params.sceneId, body.html);
    return NextResponse.json({ saved: true });
  } catch (error) {
    const result = toErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
