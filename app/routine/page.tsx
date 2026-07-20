import type { Metadata } from "next";
import { CockpitNav } from "@/components/cockpit/CockpitNav";
import { RoutineBoard } from "@/components/routine/RoutineBoard";

export const metadata: Metadata = {
  title: "Routine",
  description: "A gentle structure for knowing what kind of time it is.",
};

export default function RoutinePage() {
  return (
    <div className="page-shell">
      <CockpitNav />
      <header className="page-intro">
        <p className="!mt-0 !text-xs uppercase !tracking-[0.22em] !text-moss">
          A rhythm to return to
        </p>
        <h1>Daily Routine</h1>
        <p>
          A default shape for spacious days. The blocks decide what kind of
          time it is; you still decide what belongs inside them.
        </p>
      </header>
      <RoutineBoard />
    </div>
  );
}
