"use client";

import { useState } from "react";
import { Tabs } from "./Tabs";
import { WineDetailsTab } from "./WineDetailsTab";
import { TastingsTab } from "./TastingsTab";
import { MovementsTab } from "./MovementsTab";
import { ExportTab } from "./ExportTab";
import type { Wine, Tasting, Movement } from "@/types/db";
import { useRouter } from "next/navigation";
import { FileText, Wine as WineIcon, Package, Download } from "lucide-react";

interface WineTabsClientProps {
  wine: Wine;
  tastings: Tasting[];
  movements: Movement[];
}

const tabs = [
  { id: "details", label: "Scheda", icon: <FileText className="h-4 w-4" /> },
  { id: "tastings", label: "Degustazioni", icon: <WineIcon className="h-4 w-4" /> },
  { id: "movements", label: "Movimenti", icon: <Package className="h-4 w-4" /> },
  { id: "export", label: "Export", icon: <Download className="h-4 w-4" /> },
];

export function WineTabsClient({
  wine,
  tastings,
  movements,
}: WineTabsClientProps) {
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <div>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "details" && (
          <WineDetailsTab wine={wine} onUpdate={handleUpdate} />
        )}
        {activeTab === "tastings" && (
          <TastingsTab wineId={wine.id} tastings={tastings} />
        )}
        {activeTab === "movements" && (
          <MovementsTab movements={movements} />
        )}
        {activeTab === "export" && (
          <ExportTab wine={wine} tastings={tastings} />
        )}
      </div>
    </div>
  );
}

