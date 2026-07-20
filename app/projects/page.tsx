import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/content/projects";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Projects</h1>
        <p>
          Experiments with enough gravity to become real things. Some are
          useful, some are curious, and most begin as a question I cannot leave
          alone.
        </p>
      </header>
      <div className="grid gap-6 pb-16 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}
