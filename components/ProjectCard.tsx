import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="soft-card group flex h-full flex-col p-7 md:p-8">
      <div className="mb-8 flex items-start justify-between gap-5">
        <h3 className="font-display text-2xl text-ink">{project.title}</h3>
        <span className="status-pill shrink-0">{project.status}</span>
      </div>
      <p className="text-base leading-7 text-ink/80">{project.description}</p>
      <div className="my-6 h-px bg-ink/10" />
      <p className="mt-auto text-sm leading-6 text-muted">
        {project.longDescription}
      </p>
    </article>
  );
}
