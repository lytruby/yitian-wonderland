"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SessionRemark({
  sessionId,
  initialRemark,
  elapsedSeconds,
}: {
  sessionId: string;
  initialRemark: string | null;
  elapsedSeconds: number;
}) {
  const router = useRouter();
  const [remark, setRemark] = useState(initialRemark ?? "");
  const [savedRemark, setSavedRemark] = useState(initialRemark ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);

  async function save() {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/action-sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        elapsedSeconds,
        note: remark,
      }),
    });

    if (response.ok) {
      const cleanRemark = remark.trim();
      setSavedRemark(cleanRemark);
      setRemark(cleanRemark);
      setEditing(false);
      window.dispatchEvent(new Event("compass-session-updated"));
      router.refresh();
    } else {
      setError("The remark could not be saved. Please try again.");
    }
    setSaving(false);
  }

  async function removeSession() {
    if (
      !window.confirm(
        "Delete this single completion record? The action card itself will stay in your library.",
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    const response = await fetch(`/api/action-sessions/${sessionId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setDeleted(true);
      window.dispatchEvent(new Event("compass-session-updated"));
      router.refresh();
    } else {
      setError("The completion record could not be deleted.");
    }
    setSaving(false);
  }

  if (deleted) return null;

  if (!editing) {
    return (
      <div className={savedRemark ? "mt-5 border-t border-ink/10 pt-5" : "mt-4"}>
        {savedRemark ? (
          <p className="text-sm leading-7 text-muted">
            “{renderRemark(savedRemark)}”
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`text-xs text-moss underline decoration-moss/20 underline-offset-4 transition hover:text-ink ${
            savedRemark ? "mt-3" : ""
          }`}
        >
          {savedRemark ? "Edit remark" : "+ Add remark"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={removeSession}
          className={`ml-4 text-xs text-muted underline decoration-ink/10 underline-offset-4 transition hover:text-red-700 disabled:opacity-50 ${
            savedRemark ? "mt-3" : ""
          }`}
        >
          Delete record
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-ink/10 pt-5">
      <label>
        <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-moss">
          What actually happened?
        </span>
        <textarea
          rows={4}
          maxLength={2000}
          value={remark}
          onChange={(event) => setRemark(event.target.value)}
          placeholder="Capture what you did, what changed, what was difficult, or what comes next."
          className="w-full rounded-xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-muted/60 focus:border-lavender/50"
        />
      </label>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-full bg-ink px-4 py-2 text-xs text-paper transition hover:bg-moss disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save remark"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRemark(savedRemark);
            setEditing(false);
            setError("");
          }}
          className="text-xs text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function renderRemark(remark: string) {
  return remark.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part;

    return (
      <a
        key={`${part}-${index}`}
        href={part}
        target="_blank"
        rel="noreferrer"
        className="break-all text-moss underline decoration-moss/30 underline-offset-4 transition hover:text-ink"
      >
        {part}
      </a>
    );
  });
}
