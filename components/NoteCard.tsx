import type { Note } from "@/lib/types";

export function NoteCard({ note }: { note: Note }) {
  return (
    <article className="group border-b border-ink/10 py-7 transition-transform duration-300 hover:translate-x-1">
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-moss">
        {note.category}
      </p>
      <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-lavender">
        {note.title}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        {note.excerpt}
      </p>
    </article>
  );
}
