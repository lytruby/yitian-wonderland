import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type {
  Presentation,
  PresentationManifest,
  PresentationScene,
  PresentationSummary,
} from "./types";

const ROOT = path.join(process.cwd(), "content", "presentations");
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*$/;

function assertSafeName(value: string, label: string) {
  if (!SAFE_NAME.test(value)) {
    throw new PresentationStorageError(`Invalid ${label}.`, 400);
  }
}

function presentationDir(slug: string) {
  assertSafeName(slug, "presentation slug");
  return path.join(ROOT, slug);
}

function scenePath(slug: string, file: string) {
  assertSafeName(slug, "presentation slug");
  if (!/^[a-z0-9][a-z0-9-]*\.html$/.test(file)) {
    throw new PresentationStorageError("Invalid scene file.", 400);
  }
  return path.join(ROOT, slug, "scenes", file);
}

async function readManifest(slug: string): Promise<PresentationManifest> {
  try {
    const raw = await fs.readFile(
      path.join(presentationDir(slug), "presentation.json"),
      "utf8",
    );
    return JSON.parse(raw) as PresentationManifest;
  } catch (error) {
    if (isMissing(error)) {
      throw new PresentationStorageError("Presentation not found.", 404);
    }
    if (error instanceof SyntaxError) {
      throw new PresentationStorageError("Presentation metadata is invalid.", 500);
    }
    throw error;
  }
}

async function writeManifest(slug: string, manifest: PresentationManifest) {
  await fs.writeFile(
    path.join(presentationDir(slug), "presentation.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

export async function listPresentations(): Promise<PresentationSummary[]> {
  await fs.mkdir(ROOT, { recursive: true });
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const results = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && SAFE_NAME.test(entry.name))
      .map(async (entry) => {
        try {
          const manifest = await readManifest(entry.name);
          return {
            slug: manifest.slug,
            title: manifest.title,
            coverText: manifest.coverText,
            updatedAt: manifest.updatedAt,
            sceneCount: manifest.scenes.length,
          };
        } catch {
          return null;
        }
      }),
  );

  return results
    .filter((item): item is PresentationSummary => item !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPresentation(slug: string): Promise<Presentation> {
  const manifest = await readManifest(slug);
  const script = await fs.readFile(
    path.join(presentationDir(slug), "script.md"),
    "utf8",
  );
  return { ...manifest, script };
}

export async function createPresentation(input: {
  title: string;
  coverText?: string;
}): Promise<Presentation> {
  const base = slugify(input.title) || "untitled";
  let slug = base;
  let suffix = 2;
  while (await exists(path.join(ROOT, slug))) {
    slug = `${base}-${suffix++}`;
  }

  const now = new Date().toISOString();
  const manifest: PresentationManifest = {
    slug,
    title: input.title.trim() || "未命名口播",
    coverText: input.coverText?.trim() || "",
    scenes: [],
    updatedAt: now,
  };
  await fs.mkdir(path.join(ROOT, slug, "scenes"), { recursive: true });
  await writeManifest(slug, manifest);
  await fs.writeFile(path.join(ROOT, slug, "script.md"), "", "utf8");
  return { ...manifest, script: "" };
}

export async function updatePresentation(
  slug: string,
  input: {
    title: string;
    coverText: string;
    script: string;
    scenes: PresentationScene[];
  },
): Promise<Presentation> {
  const current = await readManifest(slug);
  const knownFiles = new Set(current.scenes.map((scene) => scene.file));
  const ids = new Set<string>();
  for (const scene of input.scenes) {
    assertSafeName(scene.id, "scene id");
    if (!knownFiles.has(scene.file) || ids.has(scene.id)) {
      throw new PresentationStorageError("Invalid scene list.", 400);
    }
    ids.add(scene.id);
  }

  const manifest: PresentationManifest = {
    ...current,
    title: input.title.trim() || "未命名口播",
    coverText: input.coverText.trim(),
    scenes: input.scenes.map((scene) => ({
      id: scene.id,
      title: scene.title.trim() || "未命名画面",
      file: scene.file,
      ...(scene.scriptParagraphs
        ? { scriptParagraphs: scene.scriptParagraphs }
        : {}),
    })),
    updatedAt: new Date().toISOString(),
  };
  await Promise.all([
    writeManifest(slug, manifest),
    fs.writeFile(path.join(presentationDir(slug), "script.md"), input.script, "utf8"),
  ]);
  return { ...manifest, script: input.script };
}

export async function getSceneHtml(slug: string, sceneId: string) {
  assertSafeName(sceneId, "scene id");
  const manifest = await readManifest(slug);
  const scene = manifest.scenes.find((item) => item.id === sceneId);
  if (!scene) throw new PresentationStorageError("Scene not found.", 404);
  return fs.readFile(scenePath(slug, scene.file), "utf8");
}

export async function updateSceneHtml(
  slug: string,
  sceneId: string,
  html: string,
) {
  assertSafeName(sceneId, "scene id");
  const manifest = await readManifest(slug);
  const scene = manifest.scenes.find((item) => item.id === sceneId);
  if (!scene) throw new PresentationStorageError("Scene not found.", 404);
  if (typeof html !== "string" || html.length > 1_000_000) {
    throw new PresentationStorageError("Invalid scene HTML.", 400);
  }
  await fs.writeFile(scenePath(slug, scene.file), html, "utf8");
  await writeManifest(slug, {
    ...manifest,
    updatedAt: new Date().toISOString(),
  });
  return html;
}

export async function createScene(slug: string, title: string) {
  const manifest = await readManifest(slug);
  const base = slugify(title) || "scene";
  let id = base;
  let suffix = 2;
  while (manifest.scenes.some((scene) => scene.id === id)) {
    id = `${base}-${suffix++}`;
  }
  const scene: PresentationScene = { id, title: title.trim() || "未命名画面", file: `${id}.html` };
  const html = blankSceneHtml(scene.title);
  await fs.writeFile(scenePath(slug, scene.file), html, "utf8");
  const next = {
    ...manifest,
    scenes: [...manifest.scenes, scene],
    updatedAt: new Date().toISOString(),
  };
  await writeManifest(slug, next);
  return scene;
}

export async function deleteScene(slug: string, sceneId: string) {
  assertSafeName(sceneId, "scene id");
  const manifest = await readManifest(slug);
  const scene = manifest.scenes.find((item) => item.id === sceneId);
  if (!scene) throw new PresentationStorageError("Scene not found.", 404);
  await fs.unlink(scenePath(slug, scene.file));
  await writeManifest(slug, {
    ...manifest,
    scenes: manifest.scenes.filter((item) => item.id !== sceneId),
    updatedAt: new Date().toISOString(),
  });
}

export class PresentationStorageError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof PresentationStorageError) {
    return { message: error.message, status: error.status };
  }
  console.error(error);
  return { message: "Unable to access presentation files.", status: 500 };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function exists(target: string) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function isMissing(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function blankSceneHtml(title: string) {
  const safeTitle = title.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    };
    return entities[character];
  });
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f5f1e8; color: #282a26; font-family: system-ui, sans-serif; }
    h1 { font-size: clamp(3rem, 8vw, 7rem); font-weight: 500; }
  </style>
</head>
<body>
  <h1>${safeTitle}</h1>
</body>
</html>
`;
}
