import type { Metadata } from "next";
import { CockpitNav } from "@/components/cockpit/CockpitNav";
import { ActionLibraryManager } from "@/components/today-compass/Compass";
import { prisma } from "@/lib/prisma";
import type {
  ActionCard,
  ActionCategory,
  AvailableTime,
  Energy,
  Focus,
} from "@/lib/today-compass/types";

export const metadata: Metadata = {
  title: "Action Cards",
  description: "A library of concrete actions for days with different shapes.",
};

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const records = await prisma.actionCard.findMany({
    orderBy: { createdAt: "asc" },
  });
  const toActionCard = (record: (typeof records)[number]): ActionCard => ({
    id: record.id,
    title: record.title,
    description: record.description,
    minutes: record.minutes as AvailableTime,
    energy: record.energy as Energy,
    focus: record.focus as Focus,
    category: record.category as ActionCategory,
    thread: record.thread,
  });
  const actions = records
    .filter((record) => record.archivedAt === null)
    .map(toActionCard);
  const archivedActions = records
    .filter((record) => record.archivedAt !== null)
    .map(toActionCard);

  return (
    <div className="page-shell">
      <CockpitNav />
      <header className="page-intro !pb-10">
        <p className="!mt-0 !text-xs uppercase !tracking-[0.22em] !text-moss">
          Possibilities with edges
        </p>
        <h1>Action Cards</h1>
        <p>
          Create, organize, archive, and log the concrete things you might
          gently begin.
        </p>
      </header>
      <ActionLibraryManager
        initialActions={actions}
        initialArchivedActions={archivedActions}
      />
    </div>
  );
}
