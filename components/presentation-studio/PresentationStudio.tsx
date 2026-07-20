"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Presentation,
  PresentationScene,
  PresentationSummary,
} from "@/lib/presentation-studio/types";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

export function PresentationStudio({
  initialSummaries,
  initialPresentation,
}: {
  initialSummaries: PresentationSummary[];
  initialPresentation: Presentation | null;
}) {
  const [summaries, setSummaries] = useState(initialSummaries);
  const [presentation, setPresentation] = useState(initialPresentation);
  const [activeSceneId, setActiveSceneId] = useState(
    initialPresentation?.scenes[0]?.id ?? "",
  );
  const [sceneHtml, setSceneHtml] = useState("");
  const [sceneSource, setSceneSource] = useState("");
  const [sceneSourceDirty, setSceneSourceDirty] = useState(false);
  const [sceneSaving, setSceneSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"preview" | "source">("preview");
  const [sceneRevision, setSceneRevision] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [presenting, setPresenting] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [creating, setCreating] = useState(false);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [teleprompter, setTeleprompter] = useState(false);
  const [cueIndex, setCueIndex] = useState(0);
  const [cueFontSize, setCueFontSize] = useState(44);
  const stageRef = useRef<HTMLDivElement>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();
  const activeScene =
    presentation?.scenes.find((scene) => scene.id === activeSceneId) ?? null;
  const activeIndex = presentation?.scenes.findIndex(
    (scene) => scene.id === activeSceneId,
  ) ?? -1;
  const cueLines = useMemo(
    () => buildCueLines(presentation?.script ?? ""),
    [presentation?.script],
  );
  const sceneScriptSections = useMemo(
    () =>
      buildSceneScriptSections(
        presentation?.script ?? "",
        presentation?.scenes ?? [],
      ),
    [presentation?.scenes, presentation?.script],
  );

  const loadPresentation = useCallback(async (slug: string) => {
    setError("");
    const response = await fetch(`/api/presentations/${slug}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "无法读取演示稿。");
      return;
    }
    setPresentation(data);
    setActiveSceneId(data.scenes[0]?.id ?? "");
    setSaveState("idle");
  }, []);

  const refreshScene = useCallback(async () => {
    if (!presentation || !activeSceneId) {
      setSceneHtml("");
      return;
    }
    const response = await fetch(
      `/api/presentations/${presentation.slug}/scenes/${activeSceneId}?v=${Date.now()}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "无法读取 HTML 画面。");
      return;
    }
    const html = await response.text();
    setSceneSource(html);
    setSceneSourceDirty(false);
    setSceneHtml(injectPresentationBridge(html));
    setSceneRevision((value) => value + 1);
  }, [activeSceneId, presentation]);

  useEffect(() => {
    void refreshScene();
  }, [refreshScene]);

  useEffect(() => {
    if (!presentation || saveState !== "dirty") return;
    const timer = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const response = await fetch(`/api/presentations/${presentation.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(presentation),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "保存失败。");
        setPresentation(data);
        setSummaries((current) =>
          current.map((item) =>
            item.slug === data.slug
              ? {
                  slug: data.slug,
                  title: data.title,
                  coverText: data.coverText,
                  updatedAt: data.updatedAt,
                  sceneCount: data.scenes.length,
                }
              : item,
          ),
        );
        setSaveState("saved");
      } catch (saveError) {
        setSaveState("error");
        setError(saveError instanceof Error ? saveError.message : "保存失败。");
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [presentation, saveState]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 1800);
  }, []);

  const moveScene = useCallback(
    (direction: -1 | 1) => {
      if (!presentation || activeIndex < 0) return;
      const next = Math.min(
        presentation.scenes.length - 1,
        Math.max(0, activeIndex + direction),
      );
      setActiveSceneId(presentation.scenes[next]?.id ?? activeSceneId);
    },
    [activeIndex, activeSceneId, presentation],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.source !== "presentation-scene") return;
      if (event.data.command === "previous") moveScene(-1);
      if (event.data.command === "next") moveScene(1);
      if (event.data.command === "reset") setSceneRevision((value) => value + 1);
      if (event.data.command === "exit") void document.exitFullscreen?.();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [moveScene]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const isFull = document.fullscreenElement === stageRef.current;
      setPresenting(isFull);
      if (isFull) showControls();
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [showControls]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (teleprompter) {
        if (event.key === "Escape") {
          setTeleprompter(false);
          return;
        }
        if (event.key === " " || event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          setCueIndex((value) => Math.min(cueLines.length - 1, value + 1));
          return;
        }
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
          event.preventDefault();
          setCueIndex((value) => Math.max(0, value - 1));
          return;
        }
      }
      if (event.key === "Escape" && scriptExpanded) {
        setScriptExpanded(false);
        return;
      }
      if (!presenting) return;
      if (event.key === "Escape" && !document.fullscreenElement) {
        setPresenting(false);
        return;
      }
      if (event.key === "ArrowLeft") moveScene(-1);
      if (event.key === "ArrowRight") moveScene(1);
      if (event.key.toLowerCase() === "r") setSceneRevision((value) => value + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    cueLines.length,
    moveScene,
    presenting,
    scriptExpanded,
    teleprompter,
  ]);

  useEffect(() => {
    if (!teleprompter) return;
    document
      .getElementById(`cue-${cueIndex}`)
      ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [cueIndex, teleprompter]);

  function updatePresentation(patch: Partial<Presentation>) {
    setPresentation((current) => (current ? { ...current, ...patch } : current));
    setSaveState("dirty");
  }

  async function createPresentation() {
    const title = window.prompt("给这条口播起个名字：", "新的口播");
    if (!title?.trim()) return;
    setCreating(true);
    const response = await fetch("/api/presentations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await response.json();
    setCreating(false);
    if (!response.ok) {
      setError(data.error ?? "无法创建演示稿。");
      return;
    }
    setSummaries((current) => [
      {
        slug: data.slug,
        title: data.title,
        coverText: data.coverText,
        updatedAt: data.updatedAt,
        sceneCount: 0,
      },
      ...current,
    ]);
    setPresentation(data);
    setActiveSceneId("");
  }

  async function createScene() {
    if (!presentation) return;
    const title = window.prompt("这个画面叫什么？", "新的画面");
    if (!title?.trim()) return;
    const response = await fetch(
      `/api/presentations/${presentation.slug}/scenes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "无法创建画面。");
      return;
    }
    setPresentation((current) =>
      current ? { ...current, scenes: [...current.scenes, data] } : current,
    );
    setActiveSceneId(data.id);
    setSaveState("saved");
  }

  async function removeScene(scene: PresentationScene) {
    if (!presentation || !window.confirm(`删除“${scene.title}”及它的 HTML 文件？`)) {
      return;
    }
    const response = await fetch(
      `/api/presentations/${presentation.slug}/scenes/${scene.id}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "无法删除画面。");
      return;
    }
    const scenes = presentation.scenes.filter((item) => item.id !== scene.id);
    setPresentation({ ...presentation, scenes });
    setActiveSceneId(scenes[0]?.id ?? "");
    setSaveState("saved");
  }

  function reorderScene(index: number, direction: -1 | 1) {
    if (!presentation) return;
    const target = index + direction;
    if (target < 0 || target >= presentation.scenes.length) return;
    const scenes = [...presentation.scenes];
    [scenes[index], scenes[target]] = [scenes[target], scenes[index]];
    updatePresentation({ scenes });
  }

  function renameScene(scene: PresentationScene) {
    if (!presentation) return;
    const title = window.prompt("修改画面名称：", scene.title);
    if (!title?.trim()) return;
    updatePresentation({
      scenes: presentation.scenes.map((item) =>
        item.id === scene.id ? { ...item, title: title.trim() } : item,
      ),
    });
  }

  async function startPresentation() {
    if (!activeScene) return;
    setPresenting(true);
    try {
      await stageRef.current?.requestFullscreen();
    } catch {
      showControls();
    }
  }

  async function saveSceneSource() {
    if (!presentation || !activeScene) return;
    setSceneSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/presentations/${presentation.slug}/scenes/${activeScene.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html: sceneSource }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "无法保存 HTML。");
      setSceneHtml(injectPresentationBridge(sceneSource));
      setSceneRevision((value) => value + 1);
      setSceneSourceDirty(false);
      setPreviewMode("preview");
    } catch (sceneError) {
      setError(sceneError instanceof Error ? sceneError.message : "无法保存 HTML。");
    } finally {
      setSceneSaving(false);
    }
  }

  if (!presentation) {
    return (
      <section className="soft-card grid min-h-[440px] place-items-center p-8 text-center">
        <div>
          <p className="font-display text-3xl">从一段想说的话开始</p>
          <p className="mt-3 text-sm text-muted">口播与 HTML 都会保存在项目文件里。</p>
          <button
            onClick={() => void createPresentation()}
            disabled={creating}
            className="mt-7 rounded-full bg-ink px-6 py-3 text-sm text-paper"
          >
            {creating ? "正在创建…" : "新建口播"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {error ? (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm text-red-800">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="关闭错误">×</button>
        </div>
      ) : null}

      <div className="grid min-h-[720px] overflow-hidden rounded-[2rem] border border-white/80 bg-white/45 shadow-soft lg:grid-cols-[240px_minmax(300px,0.8fr)_minmax(460px,1.35fr)]">
        <aside className="border-b border-ink/10 bg-white/25 p-4 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">口播</p>
            <button
              onClick={() => void createPresentation()}
              className="rounded-full border border-ink/10 px-2.5 py-1 text-xs text-muted hover:text-ink"
            >
              ＋
            </button>
          </div>
          <select
            value={presentation.slug}
            onChange={(event) => void loadPresentation(event.target.value)}
            className="mt-3 w-full rounded-xl border border-ink/10 bg-paper/60 px-3 py-2.5 text-sm outline-none"
          >
            {summaries.map((item) => (
              <option key={item.slug} value={item.slug}>{item.title}</option>
            ))}
          </select>

          <div className="mt-7 flex items-center justify-between px-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">演示画面</p>
            <button
              onClick={() => void createScene()}
              className="rounded-full border border-ink/10 px-2.5 py-1 text-xs text-muted hover:text-ink"
            >
              ＋
            </button>
          </div>
          <ol className="mt-3 space-y-2">
            {presentation.scenes.map((scene, index) => (
              <li
                key={scene.id}
                className={`group rounded-2xl border p-3 transition ${
                  activeSceneId === scene.id
                    ? "border-lavender/30 bg-lavender/10"
                    : "border-transparent hover:bg-white/50"
                }`}
              >
                <button
                  onClick={() => setActiveSceneId(scene.id)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span className="mt-0.5 text-xs tabular-nums text-lavender">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">
                    {scene.title}
                  </span>
                </button>
                <div className="mt-2 flex justify-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <TinyButton label="上移" onClick={() => reorderScene(index, -1)}>↑</TinyButton>
                  <TinyButton label="下移" onClick={() => reorderScene(index, 1)}>↓</TinyButton>
                  <TinyButton label="重命名" onClick={() => renameScene(scene)}>✎</TinyButton>
                  <TinyButton label="删除" onClick={() => void removeScene(scene)}>×</TinyButton>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        {scriptExpanded ? (
          <button
            type="button"
            aria-label="收起口播编辑器"
            onClick={() => setScriptExpanded(false)}
            className="fixed inset-0 z-40 cursor-default bg-ink/20 backdrop-blur-sm"
          />
        ) : null}

        <main
          className={`border-b border-ink/10 p-5 lg:border-b-0 lg:border-r md:p-7 ${
            scriptExpanded
              ? "fixed inset-4 z-50 overflow-y-auto rounded-[2rem] border border-white/80 bg-paper shadow-2xl md:inset-8 lg:p-9"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">口播稿</p>
            <div className="flex items-center gap-3">
              <SaveIndicator state={saveState} />
              <button
                type="button"
                onClick={() => setScriptExpanded((value) => !value)}
                className="rounded-full border border-ink/10 bg-white/40 px-3 py-1.5 text-xs text-muted transition hover:border-lavender/30 hover:text-ink"
              >
                {scriptExpanded ? "收起" : "展开"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCueIndex(0);
                  setTeleprompter(true);
                }}
                disabled={cueLines.length === 0}
                className="rounded-full bg-ink px-3 py-1.5 text-xs text-paper transition hover:bg-ink/85 disabled:opacity-35"
              >
                口播录制
              </button>
            </div>
          </div>
          <label className="mt-5 block">
            <span className="text-xs text-muted">标题</span>
            <input
              value={presentation.title}
              onChange={(event) => updatePresentation({ title: event.target.value })}
              className="mt-2 w-full border-0 border-b border-ink/10 bg-transparent pb-3 font-display text-2xl outline-none focus:border-lavender"
            />
          </label>
          <label className="mt-5 block">
            <span className="text-xs text-muted">封面文字</span>
            <input
              value={presentation.coverText}
              onChange={(event) => updatePresentation({ coverText: event.target.value })}
              className="mt-2 w-full rounded-xl border border-ink/10 bg-white/40 px-4 py-3 text-sm outline-none focus:border-lavender"
            />
          </label>
          <label className="mt-5 block">
            <span className="text-xs text-muted">Markdown 口播</span>
            <textarea
              value={presentation.script}
              onChange={(event) => updatePresentation({ script: event.target.value })}
              spellCheck={false}
              className={`mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-paper/45 p-5 text-[15px] leading-8 outline-none focus:border-lavender ${
                scriptExpanded
                  ? "h-[calc(100vh-310px)] min-h-[420px]"
                  : "h-[470px] lg:h-[525px]"
              }`}
            />
          </label>
        </main>

        <section className="flex min-w-0 flex-col p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">画面预览</p>
              <p className="mt-1 text-sm text-ink">{activeScene?.title ?? "还没有画面"}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex rounded-full border border-ink/10 bg-white/40 p-1">
                <button
                  onClick={() => setPreviewMode("preview")}
                  className={`rounded-full px-3 py-1 text-xs ${
                    previewMode === "preview" ? "bg-ink text-paper" : "text-muted"
                  }`}
                >
                  预览
                </button>
                <button
                  onClick={() => setPreviewMode("source")}
                  disabled={!activeScene}
                  className={`rounded-full px-3 py-1 text-xs disabled:opacity-40 ${
                    previewMode === "source" ? "bg-ink text-paper" : "text-muted"
                  }`}
                >
                  编辑 HTML
                </button>
              </div>
              <button
                onClick={() => void refreshScene()}
                disabled={!activeScene}
                className="rounded-full border border-ink/10 bg-white/40 px-4 py-2 text-xs text-muted hover:text-ink disabled:opacity-40"
              >
                刷新 HTML
              </button>
              <button
                onClick={() => void startPresentation()}
                disabled={!activeScene}
                className="rounded-full bg-ink px-4 py-2 text-xs text-paper disabled:opacity-40"
              >
                开始演示
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-1 items-center justify-center rounded-[1.6rem] border border-ink/10 bg-ink/5 p-3">
            {activeScene && previewMode === "preview" ? (
              <FixedCanvasPreview
                sceneId={activeSceneId}
                revision={sceneRevision}
                title={activeScene.title}
                html={sceneHtml}
              />
            ) : activeScene ? (
              <div className="flex h-full min-h-[520px] w-full flex-col">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">
                    可以直接修改文字，也可以调整完整 HTML、CSS 和 JavaScript。
                  </p>
                  <button
                    onClick={() => void saveSceneSource()}
                    disabled={!sceneSourceDirty || sceneSaving}
                    className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs text-paper disabled:opacity-35"
                  >
                    {sceneSaving ? "保存中…" : sceneSourceDirty ? "保存并预览" : "已保存"}
                  </button>
                </div>
                <textarea
                  value={sceneSource}
                  onChange={(event) => {
                    setSceneSource(event.target.value);
                    setSceneSourceDirty(true);
                  }}
                  spellCheck={false}
                  className="min-h-0 flex-1 resize-none rounded-xl border border-ink/10 bg-[#292824] p-4 font-mono text-xs leading-6 text-[#f7efe5] outline-none focus:border-lavender"
                />
              </div>
            ) : (
              <p className="text-sm text-muted">创建第一个 HTML 画面。</p>
            )}
          </div>
          {activeScene ? (
            <p className="mt-3 truncate font-mono text-[11px] text-muted">
              content/presentations/{presentation.slug}/scenes/{activeScene.file}
            </p>
          ) : null}
        </section>
      </div>

      <div
        ref={stageRef}
        onMouseMove={showControls}
        className={`${
          presenting ? "flex" : "hidden"
        } fixed inset-0 z-[60] h-screen w-screen overflow-hidden bg-[#11130f]`}
      >
        <PresentationScriptSidebar
          activeIndex={activeIndex}
          scenes={presentation.scenes}
          sections={sceneScriptSections}
        />
        <div className="relative min-w-0 flex-1">
          <FixedSceneCanvas
            sceneId={`present-${activeSceneId}`}
            revision={sceneRevision}
            title={`演示：${activeScene?.title ?? ""}`}
            html={sceneHtml}
            className="h-full w-full bg-[#11130f]"
          />
          <div
            className={`absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-7 pb-6 pt-16 text-white transition-opacity ${
              controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <button onClick={() => moveScene(-1)} disabled={activeIndex <= 0} className="disabled:opacity-30">
              ← 上一页
            </button>
            <span className="text-sm text-white/70">
              {activeScene?.title} · {activeIndex + 1}/{presentation.scenes.length}
            </span>
            <div className="flex gap-5">
              <button onClick={() => setSceneRevision((value) => value + 1)}>R 重置</button>
              <button onClick={() => moveScene(1)} disabled={activeIndex >= presentation.scenes.length - 1} className="disabled:opacity-30">
                下一页 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {teleprompter ? (
        <div className="fixed inset-0 z-[70] overflow-hidden bg-[#11120f] text-white">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-lavender/20" />
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-6 pb-12 pt-5 opacity-20 transition hover:opacity-100">
            <div className="text-xs text-white/60">
              {cueIndex + 1} / {cueLines.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCueFontSize((value) => Math.max(28, value - 4))}
                className="rounded-full border border-white/20 px-3 py-1.5 text-sm"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => setCueFontSize((value) => Math.min(72, value + 4))}
                className="rounded-full border border-white/20 px-3 py-1.5 text-sm"
              >
                A＋
              </button>
              <button
                type="button"
                onClick={() => setTeleprompter(false)}
                className="ml-2 rounded-full bg-white px-4 py-1.5 text-sm text-ink"
              >
                退出
              </button>
            </div>
          </div>

          <div className="h-full overflow-y-auto px-[12vw] py-[45vh]">
            <div className="mx-auto max-w-5xl">
              {cueLines.map((line, index) => {
                const distance = Math.abs(index - cueIndex);
                return (
                  <button
                    id={`cue-${index}`}
                    key={`${index}-${line}`}
                    type="button"
                    onClick={() => setCueIndex(index)}
                    className={`block w-full py-5 text-center font-medium leading-[1.55] transition-all duration-300 ${
                      index === cueIndex
                        ? "scale-100 text-white"
                        : distance === 1
                          ? "scale-[0.94] text-white/30"
                          : "scale-90 text-white/10"
                    }`}
                    style={{ fontSize: `${cueFontSize}px` }}
                  >
                    {line}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-5 pt-14 text-center text-xs text-white/25">
            空格 / ↓ 下一句　　↑ 上一句　　Esc 退出
          </div>
        </div>
      ) : null}
    </>
  );
}

const SceneFrame = memo(function SceneFrame({
  sceneId,
  revision,
  title,
  html,
  className = "h-full w-full border-0",
}: {
  sceneId: string;
  revision: number;
  title: string;
  html: string;
  className?: string;
}) {
  return (
    <iframe
      key={`${sceneId}-${revision}`}
      title={title}
      sandbox="allow-scripts"
      srcDoc={html}
      className={className}
    />
  );
});

const FixedCanvasPreview = memo(function FixedCanvasPreview({
  sceneId,
  revision,
  title,
  html,
}: {
  sceneId: string;
  revision: number;
  title: string;
  html: string;
}) {
  return (
    <FixedSceneCanvas
      sceneId={sceneId}
      revision={revision}
      title={title}
      html={html}
      className="aspect-video w-full rounded-xl bg-white shadow-lg"
    />
  );
});

const FixedSceneCanvas = memo(function FixedSceneCanvas({
  sceneId,
  revision,
  title,
  html,
  className,
}: {
  sceneId: string;
  revision: number;
  title: string;
  html: string;
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{
    scale: number;
    left: number;
    top: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateLayout = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const scale = Math.min(width / 1920, height / 1080);
      setLayout({
        scale,
        left: (width - 1920 * scale) / 2,
        top: (height - 1080 * scale) / 2,
      });
    };
    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute h-[1080px] w-[1920px] origin-top-left"
        style={{
          left: `${layout?.left ?? 0}px`,
          top: `${layout?.top ?? 0}px`,
          transform: `scale(${layout?.scale ?? 0})`,
          visibility: layout === null ? "hidden" : "visible",
        }}
      >
        <SceneFrame
          sceneId={sceneId}
          revision={revision}
          title={title}
          html={html}
        />
      </div>
    </div>
  );
});

const PresentationScriptSidebar = memo(function PresentationScriptSidebar({
  activeIndex,
  scenes,
  sections,
}: {
  activeIndex: number;
  scenes: PresentationScene[];
  sections: string[];
}) {
  const current = sections[activeIndex] ?? "";
  const next = sections[activeIndex + 1] ?? "";

  return (
    <aside className="relative z-20 flex h-full w-[clamp(320px,22vw,420px)] shrink-0 flex-col border-r border-white/10 bg-[#17140f] text-[#f3e7d0] shadow-2xl">
      <div className="border-b border-white/10 px-7 pb-6 pt-7">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[#b8a68b]">
          <span>口播稿</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(scenes.length).padStart(2, "0")}</span>
        </div>
        <h2 className="mt-5 font-display text-[clamp(22px,1.55vw,30px)] leading-snug text-[#fff4de]">
          {scenes[activeIndex]?.title}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        <div className="space-y-5 text-[clamp(18px,1.15vw,23px)] leading-[1.75] text-[#f3e7d0]">
          {current.split("\n").filter(Boolean).map((line, index) => (
            <p key={`${activeIndex}-${index}-${line}`}>{line}</p>
          ))}
        </div>

        {next ? (
          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f806d]">
              下一页 · {scenes[activeIndex + 1]?.title}
            </p>
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#897a67]">
              {next.replace(/\n+/g, " ")}
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 px-7 py-4 font-mono text-[10px] tracking-[0.08em] text-[#817360]">
        ← → 翻页　R 重置　Esc 退出
      </div>
    </aside>
  );
});

function TinyButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-6 w-6 place-items-center rounded-full text-xs text-muted hover:bg-white hover:text-ink"
    >
      {children}
    </button>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const label = useMemo(
    () =>
      ({
        idle: "文件已载入",
        dirty: "等待保存…",
        saving: "正在保存…",
        saved: "已保存",
        error: "保存失败",
      })[state],
    [state],
  );
  return <span className="text-xs text-muted">{label}</span>;
}

function injectPresentationBridge(html: string) {
  const bridge = `<script>
window.addEventListener("keydown", function(event) {
  var command = null;
  if (event.key === "ArrowLeft") command = "previous";
  if (event.key === "ArrowRight") command = "next";
  if (event.key.toLowerCase() === "r") command = "reset";
  if (event.key === "Escape") command = "exit";
  if (command) {
    event.preventDefault();
    window.parent.postMessage({ source: "presentation-scene", command: command }, "*");
  }
});
</script>`;
  return html.includes("</body>")
    ? html.replace("</body>", `${bridge}</body>`)
    : `${html}${bridge}`;
}

function buildCueLines(script: string) {
  const paragraphs = script
    .split(/\n+/)
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter(Boolean);

  return paragraphs.flatMap((paragraph) => {
    const sentences = paragraph.match(/[^。！？!?]+[。！？!?]?/g) ?? [paragraph];
    return sentences.flatMap((sentence) => splitLongCue(sentence.trim()));
  });
}

function buildSceneScriptSections(
  script: string,
  scenes: PresentationScene[],
) {
  const paragraphs = script
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (scenes.length === 0) return [];

  const hasExplicitBreaks = scenes.every(
    (scene) => (scene.scriptParagraphs ?? 0) > 0,
  );
  if (!hasExplicitBreaks) {
    return scenes.map((_, index) => {
      const start = Math.round((index * paragraphs.length) / scenes.length);
      const end = Math.round(((index + 1) * paragraphs.length) / scenes.length);
      return paragraphs.slice(start, end).join("\n\n");
    });
  }

  let cursor = 0;
  return scenes.map((scene, index) => {
    const count = scene.scriptParagraphs ?? 1;
    const isLast = index === scenes.length - 1;
    const section = paragraphs
      .slice(cursor, isLast ? paragraphs.length : cursor + count)
      .join("\n\n");
    cursor += count;
    return section;
  });
}

function splitLongCue(sentence: string) {
  if (sentence.length <= 34) return [sentence];
  const clauses = sentence.match(/[^，,；;]+[，,；;]?/g) ?? [sentence];
  const lines: string[] = [];
  let current = "";

  for (const clause of clauses) {
    if (current && current.length + clause.length > 34) {
      lines.push(current);
      current = clause;
    } else {
      current += clause;
    }
  }
  if (current) lines.push(current);
  return lines;
}
