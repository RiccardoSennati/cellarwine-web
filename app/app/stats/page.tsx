import { GlassCard, SectionHeader, Badge } from "@/components/glass";
import { getWineStats } from "@/features/stats/actions";
import { WineStatsView } from "@/features/stats/StatsView";
import { Package, Star, Tag, DollarSign, TrendingUp, Award } from "lucide-react";

export default async function StatsPage() {
  const stats = await getWineStats();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Statistiche"
        subtitle="Analisi dettagliata della tua cantina"
      />
      <WineStatsView stats={stats} />
    </div>
  );
}
