"use client";

import { useMemo, useState } from "react";
import { FocusTimer } from "@/components/today-compass/FocusTimer";
import { recommendActions } from "@/lib/today-compass/recommend";
import type {
  ActionCard,
  ActionCategory,
  ActionSession,
  AvailableTime,
  CompassInput,
  Energy,
  Focus,
} from "@/lib/today-compass/types";

const energyOptions: { value: Energy; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "Keep it gentle" },
  { value: "medium", label: "Steady", hint: "I have some room" },
  { value: "high", label: "Bright", hint: "Ready for depth" },
];

const focusOptions: { value: Focus; label: string }[] = [
  { value: "build", label: "Build" },
  { value: "learn", label: "Learn" },
  { value: "reflect", label: "Reflect" },
  { value: "life", label: "Life" },
];

const timeOptions: AvailableTime[] = [15, 30, 45, 60, 90];
const categoryOptions: { value: ActionCategory; label: string }[] = [
  { value: "interview", label: "Interview Prep" },
  { value: "life", label: "Life" },
  { value: "exercise", label: "Exercise" },
  { value: "content", label: "Content Creation" },
];

export function Compass({ initialActions }: { initialActions: ActionCard[] }) {
  const [actions, setActions] = useState(initialActions);
  const [input, setInput] = useState<CompassInput>({
    energy: "medium",
    minutes: 45,
    focus: "build",
  });
  const [hasAsked, setHasAsked] = useState(false);
  const [active, setActive] = useState<{
    action: ActionCard;
    session: ActionSession;
  } | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [startError, setStartError] = useState("");

  const recommendations = useMemo(
    () => recommendActions(actions, input),
    [actions, input],
  );

  async function startAction(action: ActionCard) {
    setStartingId(action.id);
    setStartError("");
    const response = await fetch("/api/action-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionCardId: action.id }),
    });

    if (response.ok) {
      setActive({
        action,
        session: (await response.json()) as ActionSession,
      });
      setHasAsked(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStartError("The timer could not begin. Please try once more.");
    }
    setStartingId(null);
  }

  return (
    <>
      {active ? (
        <FocusTimer
          action={active.action}
          session={active.session}
          onClose={() => setActive(null)}
        />
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <form
          className="rounded-[2rem] border border-white/80 bg-white/55 p-6 shadow-soft backdrop-blur-sm md:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            setHasAsked(true);
          }}
        >
          <fieldset>
            <legend className="font-display text-2xl text-ink">
              How is your energy?
            </legend>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {energyOptions.map((option) => (
                <ChoiceButton
                  key={option.value}
                  selected={input.energy === option.value}
                  onClick={() =>
                    setInput((current) => ({
                      ...current,
                      energy: option.value,
                    }))
                  }
                  label={option.label}
                  hint={option.hint}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="font-display text-2xl text-ink">
              How much time is truly yours?
            </legend>
            <div className="mt-5 flex flex-wrap gap-2">
              {timeOptions.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={input.minutes === minutes}
                  onClick={() =>
                    setInput((current) => ({ ...current, minutes }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    input.minutes === minutes
                      ? "border-moss bg-moss text-paper"
                      : "border-ink/10 bg-white/40 text-muted hover:border-moss/40 hover:text-ink"
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-10">
            <legend className="font-display text-2xl text-ink">
              What wants attention?
            </legend>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {focusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={input.focus === option.value}
                  onClick={() =>
                    setInput((current) => ({
                      ...current,
                      focus: option.value,
                    }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    input.focus === option.value
                      ? "border-lavender/50 bg-lavender/10 text-ink"
                      : "border-ink/10 bg-white/30 text-muted hover:border-lavender/30 hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={actions.length === 0}
            className="mt-10 w-full rounded-full bg-ink px-6 py-3.5 text-sm text-paper transition hover:-translate-y-0.5 hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
          >
            Find today&apos;s direction
          </button>
        </form>

        <section aria-live="polite" aria-label="Today’s recommendations">
          {hasAsked && recommendations.length > 0 ? (
            <>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-moss">
                    Your direction
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-ink">
                    Three possible next steps
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setHasAsked(false)}
                  className="text-sm text-muted underline decoration-ink/20 underline-offset-4 hover:text-ink"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-4">
                {recommendations.map(({ action, reason }, index) => (
                  <article
                    key={action.id}
                    className="rounded-[1.6rem] border border-white/80 bg-white/45 p-6 shadow-soft md:p-7"
                  >
                    <div className="flex items-start gap-5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lavender/25 font-display text-lavender">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-2xl text-ink">
                            {action.title}
                          </h3>
                          <span className="status-pill">
                            {action.minutes} min
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted">
                          {action.description}
                        </p>
                        <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-moss">
                          {reason} · {action.thread}
                        </p>
                        <button
                          type="button"
                          disabled={startingId !== null || active !== null}
                          onClick={() => startAction(action)}
                          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:-translate-y-0.5 hover:bg-moss disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {startingId === action.id
                            ? "Starting…"
                            : "✦ Start this action"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {startError ? (
                <p className="mt-4 text-sm text-red-700">{startError}</p>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-[34rem] items-center justify-center rounded-[2rem] border border-dashed border-lavender/30 p-10 text-center">
              <div className="max-w-sm">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-lavender/25 text-3xl text-lavender"
                >
                  ✦
                </div>
                <h2 className="font-display text-3xl text-ink">
                  {hasAsked
                    ? "No card fits this moment yet."
                    : "No grand plan required."}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {hasAsked
                    ? "Try a little more time, or add a smaller action card to your library."
                    : "Check in with the day as it actually is. The compass will offer a few directions—not commands."}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

    </>
  );
}

export function ActionLibraryManager({
  initialActions,
  initialArchivedActions,
}: {
  initialActions: ActionCard[];
  initialArchivedActions: ActionCard[];
}) {
  const [actions, setActions] = useState(initialActions);
  const [archivedActions, setArchivedActions] = useState(
    initialArchivedActions,
  );

  return (
    <ActionLibrary
      actions={actions}
      archivedActions={archivedActions}
      onChange={setActions}
      onArchivedChange={setArchivedActions}
    />
  );
}

function ActionLibrary({
  actions,
  archivedActions,
  onChange,
  onArchivedChange,
}: {
  actions: ActionCard[];
  archivedActions: ActionCard[];
  onChange: (actions: ActionCard[]) => void;
  onArchivedChange: (actions: ActionCard[]) => void;
}) {
  const [editing, setEditing] = useState<ActionCard | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loggedId, setLoggedId] = useState<string | null>(null);
  const [backfillCard, setBackfillCard] = useState<ActionCard | null>(null);
  const [backfillDate, setBackfillDate] = useState("");
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    ActionCategory | "archived"
  >("interview");
  const isArchivedView = selectedCategory === "archived";
  const visibleCards = isArchivedView
    ? archivedActions
    : actions.filter((card) => card.category === selectedCategory);
  const selectedLabel = isArchivedView
    ? "Archived"
    : (categoryOptions.find(
        (category) => category.value === selectedCategory,
      )?.label ?? "");

  async function remove(card: ActionCard) {
    if (!window.confirm(`Delete “${card.title}”?`)) return;

    setBusyId(card.id);
    setError("");
    const response = await fetch(`/api/action-cards/${card.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      if (isArchivedView) {
        onArchivedChange(
          archivedActions.filter((action) => action.id !== card.id),
        );
      } else {
        onChange(actions.filter((action) => action.id !== card.id));
      }
      if (editing?.id === card.id) setEditing(null);
    } else {
      const payload = (await response.json()) as { error?: string };
      setError(
        payload.error ?? "That card could not be deleted. Please try again.",
      );
    }
    setBusyId(null);
  }

  async function setArchived(card: ActionCard, archived: boolean) {
    setBusyId(card.id);
    setError("");
    const response = await fetch(`/api/action-cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });

    if (response.ok) {
      if (archived) {
        onChange(actions.filter((action) => action.id !== card.id));
        onArchivedChange([...archivedActions, card]);
      } else {
        onArchivedChange(
          archivedActions.filter((action) => action.id !== card.id),
        );
        onChange([...actions, card]);
        setSelectedCategory(card.category);
      }
      if (editing?.id === card.id) setEditing(null);
    } else {
      setError(
        archived
          ? "That card could not be archived."
          : "That card could not be restored.",
      );
    }
    setBusyId(null);
  }

  async function addToToday(card: ActionCard) {
    return logCompletion(card);
  }

  async function logCompletion(card: ActionCard, completedOn?: string) {
    setBusyId(card.id);
    setError("");
    const response = await fetch("/api/action-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionCardId: card.id,
        completeWithoutTimer: true,
        ...(completedOn ? { completedOn } : {}),
      }),
    });

    if (response.ok) {
      setLoggedId(card.id);
      setBackfillCard(null);
      window.dispatchEvent(new Event("compass-session-updated"));
      window.setTimeout(() => setLoggedId(null), 2500);
    } else {
      setError("That completion could not be logged. Please try again.");
    }
    setBusyId(null);
  }

  return (
    <section className="pb-20">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-moss">
            Your action cards
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink">
            Things you could gently begin
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setIsCreating(true);
          }}
          className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-moss"
        >
          + New action card
        </button>
      </div>

      {error ? (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {backfillCard ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void logCompletion(backfillCard, backfillDate);
          }}
          className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-lavender/20 bg-white/55 p-5"
        >
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-moss">
              Completed on
            </span>
            <input
              required
              type="date"
              max={localDateKey(new Date())}
              value={backfillDate}
              onChange={(event) => setBackfillDate(event.target.value)}
              className="rounded-xl border border-ink/10 bg-paper/70 px-4 py-2.5 text-sm text-ink outline-none focus:border-lavender/50"
            />
          </label>
          <div className="min-w-48 flex-1">
            <p className="text-sm text-ink">{backfillCard.title}</p>
            <p className="mt-1 text-xs text-muted">
              This creates one completed history record without a timer.
            </p>
          </div>
          <button
            type="submit"
            disabled={busyId !== null}
            className="rounded-full bg-ink px-4 py-2.5 text-xs text-paper transition hover:bg-moss disabled:opacity-50"
          >
            Add completion
          </button>
          <button
            type="button"
            onClick={() => setBackfillCard(null)}
            className="py-2.5 text-xs text-muted hover:text-ink"
          >
            Cancel
          </button>
        </form>
      ) : null}

      {isCreating || editing ? (
        <ActionCardForm
          card={editing}
          onCancel={() => {
            setEditing(null);
            setIsCreating(false);
          }}
          onSaved={(saved) => {
            onChange(
              editing
                ? actions.map((action) =>
                    action.id === saved.id ? saved : action,
                  )
                : [...actions, saved],
            );
            setSelectedCategory(saved.category);
            setEditing(null);
            setIsCreating(false);
          }}
        />
      ) : null}

      <nav
        aria-label="Action card categories"
        className="mt-8 flex gap-2 overflow-x-auto border-b border-ink/10 pb-3"
      >
        {categoryOptions.map((category) => {
          const count = actions.filter(
            (card) => card.category === category.value,
          ).length;
          const selected = selectedCategory === category.value;

          return (
            <button
              key={category.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition ${
                selected
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/10 bg-white/30 text-muted hover:border-moss/30 hover:text-ink"
              }`}
            >
              {category.label}
              <span
                className={`text-xs ${
                  selected ? "text-paper/60" : "text-moss"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={isArchivedView}
          onClick={() => setSelectedCategory("archived")}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition ${
            isArchivedView
              ? "border-ink bg-ink text-paper"
              : "border-ink/10 bg-white/30 text-muted hover:border-moss/30 hover:text-ink"
          }`}
        >
          Archived
          <span
            className={`text-xs ${
              isArchivedView ? "text-paper/60" : "text-moss"
            }`}
          >
            {archivedActions.length}
          </span>
        </button>
      </nav>

      <section className="mt-7">
        <h3 className="mb-4 font-display text-2xl text-ink">
          {selectedLabel}
        </h3>
        {visibleCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/10 p-7 text-sm text-muted">
            {isArchivedView
              ? "No archived cards."
              : "No cards here yet. You can create the first one."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleCards.map((card) => (
              <article
                key={card.id}
                className="rounded-2xl border border-white/80 bg-white/40 p-5"
              >
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h4 className="font-display text-xl text-ink">
                      {card.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {card.description}
                    </p>
                  </div>
                  <span className="status-pill shrink-0">
                    {card.minutes} min
                  </span>
                </div>
                <p className="mt-5 border-t border-ink/10 pt-4 text-xs capitalize text-moss">
                  {card.focus} · {card.energy} energy · {card.thread}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {isArchivedView ? (
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => setArchived(card, false)}
                      className="rounded-full border border-moss/25 px-3.5 py-2 text-xs text-moss transition hover:bg-moss/5 disabled:opacity-40"
                    >
                      Restore
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => addToToday(card)}
                        className="rounded-full border border-lavender/25 px-3.5 py-2 text-xs text-lavender transition hover:bg-lavender/5 disabled:opacity-40"
                      >
                        {loggedId === card.id
                          ? "✦ Added to today"
                          : "✦ Add to today"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => {
                          setBackfillCard(card);
                          setBackfillDate(yesterdayDateKey());
                        }}
                        className="text-xs text-muted underline decoration-ink/10 underline-offset-4 hover:text-ink disabled:opacity-40"
                      >
                        Log another date
                      </button>
                    </>
                  )}
                  <div className="ml-auto flex gap-3 text-xs">
                    {!isArchivedView ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreating(false);
                            setEditing(card);
                          }}
                          className="text-muted hover:text-ink"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busyId === card.id}
                          onClick={() => setArchived(card, true)}
                          className="text-muted hover:text-ink disabled:opacity-40"
                        >
                          Archive
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      disabled={busyId === card.id}
                      onClick={() => remove(card)}
                      className="text-muted hover:text-red-700 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function ActionCardForm({
  card,
  onCancel,
  onSaved,
}: {
  card: ActionCard | null;
  onCancel: () => void;
  onSaved: (card: ActionCard) => void;
}) {
  const [form, setForm] = useState<Omit<ActionCard, "id">>({
    title: card?.title ?? "",
    description: card?.description ?? "",
    minutes: card?.minutes ?? 30,
    energy: card?.energy ?? "medium",
    focus: card?.focus ?? "build",
    category: card?.category ?? "life",
    thread: card?.thread ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch(
      card ? `/api/action-cards/${card.id}` : "/api/action-cards",
      {
        method: card ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );

    if (response.ok) {
      onSaved((await response.json()) as ActionCard);
    } else {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "The card could not be saved.");
    }
    setSaving(false);
  }

  return (
    <form
      onSubmit={save}
      className="mb-8 rounded-[1.6rem] border border-lavender/20 bg-white/60 p-6 shadow-soft md:p-7"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-2xl text-ink">
          {card ? "Edit action card" : "New action card"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Title"
          value={form.title}
          onChange={(title) => setForm((current) => ({ ...current, title }))}
          placeholder="Tend one unfinished thought"
        />
        <TextField
          label="Thread"
          value={form.thread}
          onChange={(thread) => setForm((current) => ({ ...current, thread }))}
          placeholder="Digital garden"
        />
        <label className="md:col-span-2">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-moss">
            Description
          </span>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Describe one concrete, finishable next step."
            className="w-full rounded-xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-lavender/50"
          />
        </label>
        <SelectField
          label="Time"
          value={String(form.minutes)}
          onChange={(minutes) =>
            setForm((current) => ({
              ...current,
              minutes: Number(minutes) as AvailableTime,
            }))
          }
          options={timeOptions.map((time) => ({
            value: String(time),
            label: `${time} minutes`,
          }))}
        />
        <SelectField
          label="Energy"
          value={form.energy}
          onChange={(energy) =>
            setForm((current) => ({
              ...current,
              energy: energy as Energy,
            }))
          }
          options={energyOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
        <SelectField
          label="Focus"
          value={form.focus}
          onChange={(focus) =>
            setForm((current) => ({
              ...current,
              focus: focus as Focus,
            }))
          }
          options={focusOptions}
        />
        <SelectField
          label="Category"
          value={form.category}
          onChange={(category) =>
            setForm((current) => ({
              ...current,
              category: category as ActionCategory,
            }))
          }
          options={categoryOptions}
        />
      </div>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="mt-6 rounded-full bg-ink px-6 py-3 text-sm text-paper transition hover:bg-moss disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save action card"}
      </button>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-moss">
        {label}
      </span>
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-lavender/50"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label>
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-moss">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-ink/10 bg-paper/60 px-4 py-3 text-sm text-ink outline-none transition focus:border-lavender/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChoiceButton({
  selected,
  onClick,
  label,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-xl border px-3 py-4 text-left transition ${
        selected
          ? "border-lavender/50 bg-lavender/10"
          : "border-ink/10 bg-white/30 hover:border-lavender/30"
      }`}
    >
      <span className="block text-sm text-ink">{label}</span>
      <span className="mt-1 hidden text-[0.65rem] text-muted sm:block">
        {hint}
      </span>
    </button>
  );
}

function localDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function yesterdayDateKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}
