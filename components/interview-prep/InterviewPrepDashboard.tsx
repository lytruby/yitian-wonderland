"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  PrepEvidence,
  PrepItem,
  PrepPriority,
  PrepStatus,
  PrepTrack,
} from "@/lib/interview-prep/types";

const tracks: { value: PrepTrack; label: string }[] = [
  { value: "leetcode", label: "LeetCode" },
  { value: "frontend", label: "Frontend" },
  { value: "system_design", label: "System Design" },
];

const leetcodePatterns = [
  "Array & String",
  "Hash Map / Set",
  "Two Pointers",
  "Sliding Window",
  "Stack / Queue",
  "Linked List",
  "Binary Search",
  "Intervals",
  "Tree DFS / BFS",
  "Graph",
  "Heap",
  "Backtracking",
  "Dynamic Programming",
];

const statuses: { value: PrepStatus; label: string }[] = [
  { value: "untouched", label: "Untouched" },
  { value: "need_review", label: "Need review" },
  { value: "can_explain", label: "Can explain" },
  { value: "can_demonstrate", label: "Can demonstrate" },
];

const statusStyles: Record<PrepStatus, string> = {
  untouched: "border-ink/10 bg-white/30 text-muted",
  need_review: "border-amber-200 bg-amber-50/60 text-amber-800",
  can_explain: "border-moss/20 bg-moss/5 text-moss",
  can_demonstrate: "border-lavender/25 bg-lavender/10 text-lavender",
};

type Filter = "focus_gaps" | PrepStatus | "ready" | "all";

export function InterviewPrepDashboard({
  initialItems,
}: {
  initialItems: PrepItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [track, setTrack] = useState<PrepTrack>("leetcode");
  const [section, setSection] = useState("all");
  const [filter, setFilter] = useState<Filter>("focus_gaps");

  const trackItems = items.filter((item) => item.track === track);
  const categories =
    track === "leetcode"
      ? leetcodePatterns
      : Array.from(new Set(trackItems.map((item) => item.section)));
  const visibleItems = trackItems.filter((item) => {
    if (section !== "all" && item.section !== section) return false;
    if (filter === "all") return true;
    if (filter === "ready") {
      return (
        item.status === "can_explain" || item.status === "can_demonstrate"
      );
    }
    if (filter === "focus_gaps") {
      return (
        item.priority === "focus" ||
        item.status === "untouched" ||
        item.status === "need_review"
      );
    }
    return item.status === filter;
  });

  const focusNext = useMemo(
    () =>
      [...items]
        .filter(
          (item) =>
            item.status === "untouched" || item.status === "need_review",
        )
        .sort((a, b) => gapScore(b) - gapScore(a) || a.sortOrder - b.sortOrder)
        .slice(0, 5),
    [items],
  );

  function replaceItem(updated: PrepItem) {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  return (
    <>
      <Overview items={items} focusNext={focusNext} />

      <section className="pb-20 pt-14">
        <nav
          aria-label="Interview prep tracks"
          className="flex gap-2 overflow-x-auto border-b border-ink/10 pb-3"
        >
          {tracks.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={track === item.value}
              onClick={() => {
                setTrack(item.value);
                setSection("all");
              }}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm transition ${
                track === item.value
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/10 bg-white/30 text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === "focus_gaps"}
              onClick={() => setFilter("focus_gaps")}
            >
              Focus gaps
            </FilterButton>
            <FilterButton
              active={filter === "untouched"}
              onClick={() => setFilter("untouched")}
            >
              Untouched
            </FilterButton>
            <FilterButton
              active={filter === "need_review"}
              onClick={() => setFilter("need_review")}
            >
              Need review
            </FilterButton>
            <FilterButton
              active={filter === "ready"}
              onClick={() => setFilter("ready")}
            >
              Ready
            </FilterButton>
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All
            </FilterButton>
          </div>
          <p className="text-xs text-muted">
            {visibleItems.length} of {trackItems.length} items
          </p>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          <FilterButton
            active={section === "all"}
            onClick={() => setSection("all")}
          >
            {track === "leetcode" ? "All patterns" : "All sections"}
          </FilterButton>
          {categories.map((value) => (
            <FilterButton
              key={value}
              active={section === value}
              onClick={() => setSection(value)}
            >
              {value}
            </FilterButton>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-lavender/30 p-8 text-sm text-muted">
            No items match this view.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {visibleItems.map((item) => (
              <KnowledgeListCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Overview({
  items,
  focusNext,
}: {
  items: PrepItem[];
  focusNext: PrepItem[];
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="grid gap-3 sm:grid-cols-3">
        {tracks.map((track) => {
          const values = items.filter((item) => item.track === track.value);
          const ready = values.filter(
            (item) =>
              item.status === "can_explain" ||
              item.status === "can_demonstrate",
          ).length;
          const review = values.filter(
            (item) => item.status === "need_review",
          ).length;
          const untouched = values.filter(
            (item) => item.status === "untouched",
          ).length;
          return (
            <article
              key={track.value}
              className="rounded-[1.5rem] border border-white/80 bg-white/45 p-5 shadow-soft"
            >
              <h2 className="min-h-[3.5rem] font-display text-2xl leading-7 text-ink">
                {track.label}
              </h2>
              <p className="mt-5 text-3xl font-light text-ink">{ready}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-moss">
                Ready
              </p>
              <p className="mt-4 text-xs leading-6 text-muted">
                {review} review · {untouched} untouched
              </p>
            </article>
          );
        })}
      </div>

      <aside className="rounded-[1.5rem] border border-lavender/20 bg-lavender/5 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-lavender">
          Focus next
        </p>
        <div className="mt-5 space-y-4">
          {focusNext.map((item, index) => (
            <div key={item.id} className="flex items-start gap-4">
              <span className="font-display text-lg text-lavender/70">
                0{index + 1}
              </span>
              <div>
                <p className="text-sm text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {trackLabel(item.track)} · {item.section}
                </p>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

function PrepItemCard({
  item,
  onChange,
}: {
  item: PrepItem;
  onChange: (item: PrepItem) => void;
}) {
  const itemStatuses =
    item.track === "leetcode"
      ? [
          { value: "untouched" as const, label: "Unsolved" },
          { value: "need_review" as const, label: "Need review" },
          { value: "can_explain" as const, label: "Can solve" },
          { value: "can_demonstrate" as const, label: "Mastered" },
        ]
      : statuses;
  const [expanded, setExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [notes, setNotes] = useState(item.notes);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!notesExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [notesExpanded]);

  async function update(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/interview-prep/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      onChange(serializeItem(await response.json()));
    } else {
      setError("This item could not be saved.");
    }
    setSaving(false);
  }

  async function addEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(
      `/api/interview-prep/items/${item.id}/evidence`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: question, note: answer }),
      },
    );
    if (response.ok) {
      const evidence = (await response.json()) as PrepEvidence;
      onChange({
        ...item,
        lastReviewedAt: new Date().toISOString(),
        evidence: [evidence, ...item.evidence],
      });
      setQuestion("");
      setAnswer("");
      setAddingQuestion(false);
    } else {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "The question could not be added.");
    }
    setSaving(false);
  }

  async function deleteEvidence(evidenceId: string) {
    const response = await fetch(
      `/api/interview-prep/evidence/${evidenceId}`,
      { method: "DELETE" },
    );
    if (response.ok) {
      onChange({
        ...item,
        evidence: item.evidence.filter(
          (evidence) => evidence.id !== evidenceId,
        ),
      });
    }
  }

  return (
    <article className="rounded-2xl border border-white/80 bg-white/45 p-5">
      <div className="flex flex-wrap items-start gap-4">
        <button
          type="button"
          onClick={() =>
            update({ priority: nextPriority(item.priority) })
          }
          disabled={saving}
          aria-label={`Priority: ${item.priority}`}
          className={`mt-1 text-lg transition disabled:opacity-40 ${
            item.priority === "focus"
              ? "text-lavender"
              : item.priority === "important"
                ? "text-moss"
                : "text-ink/20 hover:text-lavender"
          }`}
        >
          {item.priority === "normal" ? "☆" : "★"}
        </button>
        <div className="min-w-52 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl text-ink">{item.title}</h3>
            <span className="text-xs text-muted">{item.section}</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            {item.lastReviewedAt
              ? `Reviewed ${formatDate(item.lastReviewedAt)}`
              : "Not reviewed yet"}
            {item.evidence.length > 0
              ? ` · ${item.evidence.length} Q&A`
              : ""}
          </p>
          {item.track === "leetcode" && item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex text-xs text-moss underline decoration-moss/20 underline-offset-4 hover:text-ink"
            >
              Open problem ↗
            </a>
          ) : null}
        </div>
        <select
          value={item.status}
          disabled={saving}
          onChange={(event) =>
            update({ status: event.target.value as PrepStatus })
          }
          className={`rounded-full border px-3 py-2 text-xs outline-none ${statusStyles[item.status]}`}
          aria-label={`Status for ${item.title}`}
        >
          {itemStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="px-2 py-2 text-xs text-muted hover:text-ink"
        >
          {expanded ? "Close" : "Details"}
        </button>
      </div>

      {expanded ? (
        <div className="mt-5 grid gap-6 border-t border-ink/10 pt-5 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.15em] text-moss">
                Notes & gaps
              <button
                type="button"
                onClick={() => setNotesExpanded(true)}
                className="normal-case tracking-normal text-muted transition hover:text-ink"
              >
                Expand ↗
              </button>
            </div>
            <textarea
              rows={10}
              maxLength={5000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What do you understand? Where do you still get stuck?"
              aria-label={`Notes for ${item.title}`}
              className="min-h-64 w-full resize-y rounded-xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-lavender/50"
            />
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => update({ notes })}
                className="rounded-full bg-ink px-4 py-2 text-xs text-paper hover:bg-moss disabled:opacity-50"
              >
                Save notes
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => update({ markReviewed: true })}
                className="text-xs text-moss hover:text-ink disabled:opacity-50"
              >
                Mark reviewed today
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-moss">
              Questions & answers
            </p>
            {item.evidence.length > 0 ? (
              <div className="mt-3 space-y-3">
                {item.evidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="rounded-xl border border-ink/10 bg-white/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {evidence.url ? (
                        <a
                          href={evidence.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-moss underline decoration-moss/20 underline-offset-4 hover:text-ink"
                        >
                          {evidence.title}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-ink">
                          {evidence.title}
                        </p>
                      )}
                      <div className="flex shrink-0 items-center gap-3">
                        {evidence.note ? (
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedAnswers((current) =>
                                current.includes(evidence.id)
                                  ? current.filter(
                                      (id) => id !== evidence.id,
                                    )
                                  : [...current, evidence.id],
                              )
                            }
                            className="text-xs text-moss hover:text-ink"
                          >
                            {revealedAnswers.includes(evidence.id)
                              ? "Hide answer"
                              : "Show answer"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => deleteEvidence(evidence.id)}
                          className="text-xs text-muted hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {evidence.note &&
                    revealedAnswers.includes(evidence.id) ? (
                      <p className="mt-3 whitespace-pre-wrap border-t border-ink/10 pt-3 text-sm leading-7 text-muted">
                        {evidence.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No questions yet. Add something you want to be able to answer
                without notes.
              </p>
            )}
            {addingQuestion ? (
              <form onSubmit={addEvidence} className="mt-4 grid gap-3">
                <input
                  required
                  autoFocus
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Question"
                  className="rounded-xl border border-ink/10 bg-paper/60 px-3 py-2.5 text-sm outline-none focus:border-lavender/50"
                />
                <textarea
                  rows={5}
                  maxLength={5000}
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Your answer (optional—you can test yourself first)"
                  className="resize-y rounded-xl border border-ink/10 bg-paper/60 px-3 py-2.5 text-sm leading-6 outline-none focus:border-lavender/50"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-fit rounded-full border border-moss/20 px-4 py-2 text-xs text-moss hover:bg-moss/5 disabled:opacity-50"
                  >
                    Save question
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingQuestion(false);
                      setQuestion("");
                      setAnswer("");
                    }}
                    className="text-xs text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setAddingQuestion(true)}
                className="mt-4 w-fit rounded-full border border-moss/20 px-4 py-2 text-xs text-moss hover:bg-moss/5"
              >
                + Add question
              </button>
            )}
          </div>
          {error ? (
            <p className="text-xs text-red-700 lg:col-span-2">{error}</p>
          ) : null}
        </div>
      ) : null}

      {notesExpanded ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/25 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Notes for ${item.title}`}
        >
          <div className="flex h-[min(88vh,900px)] w-full max-w-5xl flex-col rounded-[2rem] border border-white/80 bg-paper p-6 shadow-soft sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-moss">
                  {item.section}
                </p>
                <h3 className="mt-2 font-display text-3xl text-ink">
                  {item.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNotesExpanded(false)}
                className="rounded-full border border-ink/10 px-4 py-2 text-sm text-muted transition hover:border-ink/20 hover:text-ink"
              >
                Close
              </button>
            </div>
            <textarea
              maxLength={5000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What do you understand? Where do you still get stuck?"
              autoFocus
              className="min-h-0 flex-1 resize-none overscroll-contain rounded-2xl border border-ink/10 bg-white/45 px-5 py-4 text-base leading-8 text-ink outline-none focus:border-lavender/50"
            />
            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-xs text-muted">
                {notes.length.toLocaleString()} / 5,000
              </span>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await update({ notes });
                  setNotesExpanded(false);
                }}
                className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-moss disabled:opacity-50"
              >
                Save notes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function KnowledgeListCard({ item }: { item: PrepItem }) {
  const statusLabel =
    item.track === "leetcode"
      ? {
          untouched: "Unsolved",
          need_review: "Need review",
          can_explain: "Can solve",
          can_demonstrate: "Mastered",
        }[item.status]
      : statuses.find((status) => status.value === item.status)?.label;

  return (
    <Link
      href={`/tools/interview-prep/${item.id}`}
      className="group flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-white/80 bg-white/45 p-5 transition hover:-translate-y-0.5 hover:border-lavender/30 hover:bg-white/60 hover:shadow-soft"
    >
      <div className="min-w-52 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-xl text-ink">{item.title}</h3>
          <span className="text-xs text-muted">{item.section}</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          {item.lastReviewedAt
            ? `Reviewed ${formatDate(item.lastReviewedAt)}`
            : "Not reviewed yet"}
          <span className="mx-2 text-ink/20">·</span>
          {item.questionCount} Q&A
        </p>
      </div>
      <div className="flex items-center gap-5">
        <span className={`rounded-full border px-3 py-2 text-xs ${statusStyles[item.status]}`}>
          {statusLabel}
        </span>
        <span className="text-sm text-moss transition-transform group-hover:translate-x-1">
          Open →
        </span>
      </div>
    </Link>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-xs transition ${
        active
          ? "border-moss/30 bg-moss/10 text-moss"
          : "border-ink/10 bg-white/30 text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function gapScore(item: PrepItem) {
  const priority = { normal: 0, important: 10, focus: 20 }[item.priority];
  const status = { untouched: 4, need_review: 8, can_explain: 0, can_demonstrate: 0 }[
    item.status
  ];
  return priority + status;
}

function nextPriority(priority: PrepPriority): PrepPriority {
  if (priority === "normal") return "important";
  if (priority === "important") return "focus";
  return "normal";
}

function trackLabel(track: PrepTrack) {
  return tracks.find((item) => item.value === track)?.label ?? track;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function serializeItem(value: PrepItem): PrepItem {
  return {
    ...value,
    lastReviewedAt: value.lastReviewedAt
      ? new Date(value.lastReviewedAt).toISOString()
      : null,
    evidence: value.evidence.map((evidence) => ({
      ...evidence,
      createdAt: new Date(evidence.createdAt).toISOString(),
    })),
  };
}
