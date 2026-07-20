import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/Section";

export const metadata: Metadata = { title: "About" };

const interests = [
  "AI tools that fit real life",
  "Personal operating systems",
  "Creative workflows",
  "Writing as a way of thinking",
  "Quiet, useful interfaces",
  "Dreams and unfinished questions",
];

export default function AboutPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <p className="!mt-0 !text-xs uppercase !tracking-[0.22em] !text-moss">
          A loose self-portrait
        </p>
        <h1>About</h1>
        <p>
          I’m Yitian. I like making sense of scattered thoughts by turning them
          into notes, tools, and small experiments.
        </p>
      </header>

      <div className="grid gap-12 border-t border-ink/10 py-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20 md:py-20">
        <div>
          <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/70 bg-lavender/10 shadow-soft">
            <Image
              src="/images/yitian-about.jpg"
              alt="Yitian surrounded by newspapers and a mirrored sphere"
              fill
              sizes="(max-width: 768px) 90vw, 34vw"
              className="object-cover object-[50%_32%] saturate-[0.86] contrast-[0.96]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-ink/10 via-transparent to-white/5"
              aria-hidden="true"
            />
          </figure>
          <p className="mt-7 font-display text-3xl leading-snug text-ink">
            Somewhere between engineering, writing, and everyday life.
          </p>
        </div>
        <div className="space-y-6 text-base leading-8 text-muted">
          <p>
            I’m interested in AI tools, personal operating systems, creative
            workflows, and the strange space between engineering, writing, and
            everyday life.
          </p>
          <p>
            I tend to begin with a messy question rather than a neat brief. I
            collect fragments, look for a shape, and build the smallest thing
            that might make the idea real. Sometimes it becomes software.
            Sometimes it stays a note. Both count.
          </p>
        </div>
      </div>

      <Section title="What I like exploring">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {interests.map((interest, index) => (
            <div
              key={interest}
              className="rounded-2xl border border-ink/10 bg-white/30 p-5"
            >
              <span className="mb-5 block text-xs text-lavender">
                ✦ 0{index + 1}
              </span>
              <p className="leading-6 text-ink/80">{interest}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How I build things">
        <div className="max-w-3xl space-y-6 text-base leading-8 text-muted">
          <p>
            Slowly enough to notice what the idea actually wants, but quickly
            enough to learn from something real. I prefer small systems with
            clear edges: useful now, open to becoming stranger later.
          </p>
          <p>
            This lab is part workshop, part notebook, and part trail of
            breadcrumbs. It will probably always be unfinished. That is the
            point.
          </p>
        </div>
      </Section>
    </div>
  );
}
