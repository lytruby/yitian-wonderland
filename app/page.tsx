import Link from "next/link";
import Image from "next/image";
import { NoteCard } from "@/components/NoteCard";
import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { ToolCard } from "@/components/ToolCard";
import { notes } from "@/content/notes";
import { projects } from "@/content/projects";
import { tools } from "@/content/tools";

const threads = [
  "Building tiny systems for living",
  "Exploring AI tools for real workflows",
  "Collecting thoughts, dreams, and unfinished questions",
  "Turning scattered ideas into experiments",
];

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="relative grid min-h-[76vh] items-center gap-14 py-20 md:grid-cols-[1.2fr_0.8fr] md:gap-16 md:py-28">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-moss">
            <span className="h-px w-8 bg-moss/50" />
            Personal lab · digital garden
          </p>
          <h1 className="font-display text-6xl leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-8xl">
            Yitian&apos;s Lab
          </h1>
          <p className="mt-7 max-w-2xl font-display text-2xl leading-snug text-ink/80 md:text-3xl">
            A small digital garden for tools, thoughts, experiments, and strange
            little dreams.
          </p>
          <p className="mt-8 max-w-2xl text-base leading-8 text-muted">
            I’m a builder, explorer, and chronic overthinker. I like turning
            scattered ideas into tiny systems, useful tools, notes, and
            occasionally weird beautiful things.
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-sm md:mx-0 md:max-w-none">
          <div
            className="absolute -inset-5 rounded-[2.5rem] border border-lavender/15"
            aria-hidden="true"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/70 bg-lavender/10 shadow-soft">
            <Image
              src="/images/yitian-portrait.jpg"
              alt="Yitian in a soft, dreamlike portrait"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 36vw"
              className="object-cover object-[50%_36%] saturate-[0.88] contrast-[0.96]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-white/5"
              aria-hidden="true"
            />
          </div>
          <span
            className="absolute -right-3 top-12 text-xl text-lavender"
            aria-hidden="true"
          >
            ✦
          </span>
        </div>
      </section>

      <figure className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/30 shadow-soft">
        <div className="relative aspect-[16/7] min-h-[270px]">
          <Image
            src="/images/yitian-room.jpg"
            alt="Yitian in a dreamlike room filled with frames, newspapers, and a mirrored sphere"
            fill
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="object-cover object-[50%_52%] saturate-[0.82] contrast-[0.94]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-ink/5 via-transparent to-paper/10"
            aria-hidden="true"
          />
        </div>
        <figcaption className="absolute bottom-5 right-6 rounded-full border border-white/30 bg-paper/60 px-4 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-ink/70 backdrop-blur-md">
          Somewhere between a room and a dream
        </figcaption>
      </figure>

      <Section title="Current Threads" eyebrow="In motion">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 sm:grid-cols-2">
          {threads.map((thread, index) => (
            <div
              key={thread}
              className="flex min-h-32 items-start gap-5 bg-paper/90 p-6 md:p-8"
            >
              <span className="font-display text-lg text-lavender/80">
                0{index + 1}
              </span>
              <p className="max-w-xs leading-7 text-ink/80">{thread}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Featured Projects" eyebrow="Things taking shape">
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
        <SectionLink href="/projects">See all projects</SectionLink>
      </Section>

      <Section title="Notes" eyebrow="From the margins">
        <div className="grid gap-x-12 md:grid-cols-2">
          {notes.slice(0, 4).map((note) => (
            <NoteCard key={note.title} note={note} />
          ))}
        </div>
        <SectionLink href="/notes">Wander through the notes</SectionLink>
      </Section>

      <Section title="Tools" eyebrow="Small instruments">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
        <SectionLink href="/tools">Visit the tool shelf</SectionLink>
      </Section>
    </div>
  );
}

function SectionLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="mt-8 inline-flex items-center gap-3 text-sm text-moss transition-all hover:gap-4 hover:text-ink"
    >
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}
