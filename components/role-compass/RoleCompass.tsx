"use client";

import { useMemo, useState } from "react";
import { sampleJobs } from "@/lib/role-compass/sample-jobs";
import type { RoleTrack } from "@/lib/role-compass/types";

const trackOptions: Array<"All" | RoleTrack> = [
  "All",
  "AI Product",
  "Developer Tools",
  "Risk Platform",
  "AI Evaluation",
];

export function RoleCompass() {
  const [track, setTrack] = useState<(typeof trackOptions)[number]>("All");
  const [strictSalary, setStrictSalary] = useState(true);
  const [selectedId, setSelectedId] = useState(sampleJobs[0].id);

  const jobs = useMemo(
    () =>
      sampleJobs.filter(
        (job) =>
          (track === "All" || job.track === track) &&
          (!strictSalary || job.compensationMin === null || job.compensationMin >= 150),
      ),
    [track, strictSalary],
  );
  const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0];

  return (
    <div className="pb-20">
      <section className="grid gap-3 sm:grid-cols-3">
        <ProfileFact label="Direction" value="Senior AI software builder" />
        <ProfileFact label="Compensation" value="S$150k+ annual total" />
        <ProfileFact label="Location" value="Remote, or Singapore" />
      </section>

      <aside className="mt-4 flex flex-col gap-3 rounded-2xl border border-lavender/20 bg-lavender/5 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-ink">1 company excluded</span>
          <span className="ml-2 text-muted">Airwallex · interviewed · culture mismatch</span>
        </div>
        <span className="text-xs text-lavender">Will not appear in future results</span>
      </aside>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/45 shadow-soft backdrop-blur-sm">
        <div className="flex flex-col gap-5 border-b border-ink/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-lavender">Today’s shortlist</p>
            <h2 className="mt-2 font-display text-2xl text-ink">Only roles worth your attention</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {trackOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTrack(option)}
                className={`rounded-full border px-3.5 py-2 text-xs transition ${
                  track === option
                    ? "border-moss bg-moss text-paper"
                    : "border-ink/10 bg-white/40 text-muted hover:border-moss/30 hover:text-ink"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-[42rem] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="border-b border-ink/10 lg:border-b-0 lg:border-r">
            <label className="flex cursor-pointer items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 text-sm text-muted lg:px-7">
              Hide confirmed roles below S$150k
              <input
                type="checkbox"
                checked={strictSalary}
                onChange={(event) => setStrictSalary(event.target.checked)}
                className="h-4 w-4 accent-[#58705d]"
              />
            </label>
            <div className="p-3">
              {jobs.length ? (
                jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedId(job.id)}
                    className={`mb-2 w-full rounded-[1.4rem] border p-5 text-left transition ${
                      selected?.id === job.id
                        ? "border-lavender/35 bg-lavender/10"
                        : "border-transparent hover:border-ink/10 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.66rem] uppercase tracking-[0.16em] text-moss">{job.track}</p>
                        <h3 className="mt-2 font-display text-xl leading-6 text-ink">{job.title}</h3>
                        <p className="mt-2 text-sm text-muted">{job.company} · {job.mode}</p>
                      </div>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-moss/20 bg-moss/5 font-display text-lg text-moss">
                        {job.match}
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs">
                      <span className="text-ink">{job.compensation}</span>
                      <span className="text-muted">{job.posted}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-10 text-center text-sm leading-6 text-muted">No sample role fits this filter yet.</div>
              )}
            </div>
          </div>

          {selected ? (
            <article className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-xl">
                  <span className="status-pill">Live role · source checked</span>
                  <h2 className="mt-5 font-display text-3xl leading-tight text-ink md:text-4xl">{selected.title}</h2>
                  <p className="mt-3 text-sm text-muted">{selected.company} · {selected.mode} · {selected.compensation}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-4xl text-moss">{selected.match}%</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">profile match</p>
                </div>
              </div>

              <p className="mt-7 max-w-2xl text-base leading-7 text-muted">{selected.summary}</p>

              <DetailSection title="Why it deserves a look">
                {selected.reasons.map((reason) => (
                  <li key={reason} className="flex gap-3"><span className="text-moss">✓</span><span>{reason}</span></li>
                ))}
              </DetailSection>

              <DetailSection title="Evidence found in the role">
                <div className="flex flex-wrap gap-2">
                  {selected.signals.map((signal) => (
                    <span key={signal} className="rounded-full border border-lavender/20 bg-lavender/5 px-3 py-1.5 text-xs text-ink">{signal}</span>
                  ))}
                </div>
              </DetailSection>

              <DetailSection title="Check before applying">
                {selected.gaps.map((gap) => (
                  <li key={gap} className="flex gap-3"><span className="text-lavender">○</span><span>{gap}</span></li>
                ))}
              </DetailSection>

              <div className="mt-8 rounded-2xl border border-ink/10 bg-paper/70 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Search query behind this match</p>
                <code className="mt-2 block break-words text-xs leading-5 text-moss">{selected.searchQuery}</code>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-5 py-3 text-sm text-paper transition hover:-translate-y-0.5 hover:bg-moss">View & apply on {selected.sourceLabel} ↗</a>
                <button type="button" className="rounded-full border border-ink/15 px-5 py-3 text-sm text-ink transition hover:border-lavender/40 hover:bg-white/60">Not for me</button>
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <p className="mt-5 text-center text-xs leading-5 text-muted">Live results manually verified on 15 July 2026 · Compensation is shown only when the listing publishes it.</p>
    </div>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/35 px-5 py-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-sm text-ink">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-ink/10 pt-6">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">{children}</ul>
    </section>
  );
}
