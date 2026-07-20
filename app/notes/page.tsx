import type { Metadata } from "next";
import { NoteCard } from "@/components/NoteCard";
import { notes } from "@/content/notes";

export const metadata: Metadata = { title: "Notes" };

export default function NotesPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Notes</h1>
        <p>
          A collection of thoughts in various states of becoming—field notes,
          working theories, useful fragments, and the occasional dream.
        </p>
      </header>
      <div className="grid gap-x-16 border-t border-ink/10 pb-16 md:grid-cols-2">
        {notes.map((note) => (
          <NoteCard key={note.title} note={note} />
        ))}
      </div>
    </div>
  );
}
