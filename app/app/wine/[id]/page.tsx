import { notFound } from "next/navigation";
import { WineHeader } from "@/features/wine/WineHeader";
import { Tabs } from "@/features/wine/Tabs";
import { WineDetailsTab } from "@/features/wine/WineDetailsTab";
import { TastingsTab } from "@/features/wine/TastingsTab";
import { MovementsTab } from "@/features/wine/MovementsTab";
import { ExportTab } from "@/features/wine/ExportTab";
import {
  getWineWithDetails,
  getWineTastings,
  getWineMovements,
} from "@/features/wine/actions";
import { WineTabsClient } from "@/features/wine/WineTabsClient";

interface WinePageProps {
  params: Promise<{ id: string }>;
}

export default async function WinePage({ params }: WinePageProps) {
  const { id } = await params;

  // Fetch wine with auth guard
  const wine = await getWineWithDetails(id);

  if (!wine) {
    notFound();
  }

  // Fetch related data
  const [tastings, movements] = await Promise.all([
    getWineTastings(id),
    getWineMovements(id),
  ]);

  return (
    <div className="space-y-8">
      <WineHeader wine={wine} />
      <WineTabsClient
        wine={wine}
        tastings={tastings}
        movements={movements}
      />
    </div>
  );
}

