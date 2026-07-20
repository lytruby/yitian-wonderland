import type { Metadata } from "next";
import { PresentationStudio } from "@/components/presentation-studio/PresentationStudio";
import {
  getPresentation,
  listPresentations,
} from "@/lib/presentation-studio/storage";

export const metadata: Metadata = { title: "Presentation Studio" };
export const dynamic = "force-dynamic";

export default async function PresentationStudioPage() {
  const presentations = await listPresentations();
  const initialPresentation = presentations[0]
    ? await getPresentation(presentations[0].slug)
    : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pb-16 md:px-8">
      <header className="pb-5 pt-5 md:pb-6 md:pt-7">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-moss">
            Private instrument
          </p>
          <span className="hidden h-3 w-px bg-ink/15 sm:block" aria-hidden="true" />
          <p className="text-[0.65rem] text-muted">
            content/presentations
          </p>
        </div>
        <div className="mt-2 flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between md:gap-6">
          <h1 className="font-display text-4xl tracking-tight text-ink md:text-5xl">
            Presentation Studio
          </h1>
          <p className="max-w-xl pb-1 text-sm leading-6 text-muted md:text-right">
            写下你要说的话，让每一个 HTML 画面替表达多走一步。
          </p>
        </div>
      </header>
      <PresentationStudio
        initialSummaries={presentations}
        initialPresentation={initialPresentation}
      />
    </div>
  );
}
