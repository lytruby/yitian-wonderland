"use client";

import { useState } from "react";
import type { PrepStatus } from "@/lib/interview-prep/types";

export type InterviewQuestionRecord = {
  id: string;
  title: string;
  prompt: string | null;
  code: string | null;
  language: string | null;
  answer: string;
  explanation: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeItemRecord = {
  id: string;
  track: string;
  section: string;
  title: string;
  notes: string;
  status: PrepStatus;
  sourceUrl: string | null;
  lastReviewedAt: string | null;
};

const statusOptions = [
  { value: "untouched", label: "Untouched" },
  { value: "need_review", label: "Need review" },
  { value: "can_explain", label: "Can explain" },
  { value: "can_demonstrate", label: "Can demonstrate" },
] as const;

const emptyDraft = {
  title: "",
  prompt: "",
  code: "",
  language: "javascript",
  answer: "",
  explanation: "",
};

export function KnowledgeDetail({
  initialItem,
  initialQuestions,
}: {
  initialItem: KnowledgeItemRecord;
  initialQuestions: InterviewQuestionRecord[];
}) {
  const [item, setItem] = useState(initialItem);
  const [questions, setQuestions] = useState(initialQuestions);
  const [notes, setNotes] = useState(initialItem.notes);
  const [editingNotes, setEditingNotes] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function updateItem(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/interview-prep/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const updated = await response.json();
      setItem((current) => ({
        ...current,
        status: updated.status,
        notes: updated.notes,
        lastReviewedAt: updated.lastReviewedAt,
      }));
    } else {
      setError("This knowledge point could not be saved.");
    }
    setSaving(false);
  }

  async function saveNotes() {
    await updateItem({ notes });
    setEditingNotes(false);
  }

  async function addQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(
      `/api/interview-prep/items/${item.id}/questions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      },
    );
    if (response.ok) {
      const question =
        (await response.json()) as InterviewQuestionRecord;
      setQuestions((current) => [question, ...current]);
      setDraft(emptyDraft);
      setAdding(false);
      setItem((current) => ({
        ...current,
        lastReviewedAt: new Date().toISOString(),
      }));
    } else {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "The question could not be saved.");
    }
    setSaving(false);
  }

  async function removeQuestion(id: string) {
    if (!window.confirm("Delete this practice question?")) return;
    const response = await fetch(`/api/interview-prep/questions/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setQuestions((current) =>
        current.filter((question) => question.id !== id),
      );
    }
  }

  return (
    <>
      <section className="rounded-[2rem] border border-white/80 bg-white/40 p-6 shadow-soft md:p-9">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-moss">
              {item.section}
            </p>
            <h1 className="mt-3 font-display text-4xl text-ink md:text-6xl">
              {item.title}
            </h1>
            <p className="mt-3 text-sm text-muted">
              {item.lastReviewedAt
                ? `Reviewed ${formatDate(item.lastReviewedAt)}`
                : "Not reviewed yet"}
              <span className="mx-2 text-ink/20">·</span>
              {questions.length} Q&A
            </p>
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm text-moss underline decoration-moss/20 underline-offset-4"
              >
                Open original problem ↗
              </a>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={item.status}
              disabled={saving}
              onChange={(event) => {
                const status = event.target.value as PrepStatus;
                setItem((current) => ({ ...current, status }));
                void updateItem({ status });
              }}
              className="rounded-full border border-ink/10 bg-paper px-4 py-2.5 text-sm text-ink outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={saving}
              onClick={() => void updateItem({ markReviewed: true })}
              className="rounded-full border border-moss/20 px-4 py-2.5 text-sm text-moss hover:bg-moss/5"
            >
              Mark reviewed
            </button>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-lavender">
              Understand
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">Notes</h2>
          </div>
          {!editingNotes ? (
            <button
              type="button"
              onClick={() => setEditingNotes(true)}
              className="text-sm text-moss hover:text-ink"
            >
              Edit notes
            </button>
          ) : null}
        </div>

        {editingNotes ? (
          <div className="mt-6">
            <textarea
              autoFocus
              rows={18}
              maxLength={5000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-[30rem] w-full resize-y rounded-2xl border border-ink/10 bg-white/45 px-6 py-5 text-base leading-8 text-ink outline-none focus:border-lavender/50"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveNotes()}
                className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper hover:bg-moss"
              >
                Save notes
              </button>
              <button
                type="button"
                onClick={() => {
                  setNotes(item.notes);
                  setEditingNotes(false);
                }}
                className="text-sm text-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-white/80 bg-white/35 p-6 text-base leading-8 text-ink md:p-8">
            {notes || "No notes yet."}
          </div>
        )}
      </section>

      <section className="border-t border-ink/10 pb-20 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-lavender">
              Active recall
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Practice questions
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAdding((current) => !current)}
            className="rounded-full border border-moss/20 px-4 py-2 text-sm text-moss hover:bg-moss/5"
          >
            {adding ? "Close form" : "+ Add question"}
          </button>
        </div>

        {adding ? (
          <QuestionForm
            draft={draft}
            setDraft={setDraft}
            saving={saving}
            onSubmit={addQuestion}
          />
        ) : null}

        {error ? <p className="mt-5 text-sm text-red-700">{error}</p> : null}

        <div className="mt-8 space-y-4">
          {questions.length > 0 ? (
            questions.map((question) => (
              <PracticeQuestion
                key={question.id}
                question={question}
                onRemove={() => void removeQuestion(question.id)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-lavender/30 p-8 text-sm text-muted">
              No practice questions yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function PracticeQuestion({
  question,
  onRemove,
}: {
  question: InterviewQuestionRecord;
  onRemove: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="rounded-2xl border border-white/80 bg-white/45 p-6 shadow-soft">
      <div className="flex items-start justify-between gap-5">
        <h3 className="font-display text-2xl text-ink">{question.title}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-xs text-muted hover:text-red-700"
        >
          Delete
        </button>
      </div>
      {question.prompt ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">
          {question.prompt}
        </p>
      ) : null}
      {question.code ? (
        <div className="mt-5 overflow-hidden rounded-xl bg-ink">
          <p className="border-b border-paper/10 px-4 py-2 text-[0.65rem] uppercase tracking-[0.16em] text-paper/50">
            {question.language || "code"}
          </p>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-paper">
            <code>{question.code}</code>
          </pre>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setRevealed((current) => !current)}
        className="mt-5 text-sm text-moss hover:text-ink"
      >
        {revealed ? "Hide answer" : "Show answer"}
      </button>
      {revealed ? (
        <div className="mt-4 border-t border-ink/10 pt-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
            {question.answer || "No answer recorded yet."}
          </p>
          {question.explanation ? (
            <div className="mt-5 rounded-xl bg-lavender/5 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-lavender">
                Explanation
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted">
                {question.explanation}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function QuestionForm({
  draft,
  setDraft,
  saving,
  onSubmit,
}: {
  draft: typeof emptyDraft;
  setDraft: React.Dispatch<React.SetStateAction<typeof emptyDraft>>;
  saving: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  function field(name: keyof typeof emptyDraft, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 grid gap-4 rounded-2xl border border-lavender/20 bg-lavender/5 p-6"
    >
      <input
        required
        autoFocus
        value={draft.title}
        onChange={(event) => field("title", event.target.value)}
        placeholder="Question title"
        className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-lavender/50"
      />
      <textarea
        rows={3}
        value={draft.prompt}
        onChange={(event) => field("prompt", event.target.value)}
        placeholder="Prompt or context (optional)"
        className="resize-y rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm leading-6 outline-none focus:border-lavender/50"
      />
      <div className="grid gap-4 md:grid-cols-[1fr_12rem]">
        <textarea
          rows={8}
          value={draft.code}
          onChange={(event) => field("code", event.target.value)}
          placeholder="Code (optional)"
          className="resize-y rounded-xl border border-ink/10 bg-ink px-4 py-3 font-mono text-sm leading-6 text-paper outline-none"
        />
        <select
          value={draft.language}
          onChange={(event) => field("language", event.target.value)}
          className="h-fit rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="text">Plain text</option>
        </select>
      </div>
      <textarea
        rows={4}
        value={draft.answer}
        onChange={(event) => field("answer", event.target.value)}
        placeholder="Answer"
        className="resize-y rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm leading-6 outline-none focus:border-lavender/50"
      />
      <textarea
        rows={4}
        value={draft.explanation}
        onChange={(event) => field("explanation", event.target.value)}
        placeholder="Explanation (optional)"
        className="resize-y rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm leading-6 outline-none focus:border-lavender/50"
      />
      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm text-paper hover:bg-moss disabled:opacity-50"
      >
        Save question
      </button>
    </form>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
