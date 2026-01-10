import { GlassCard, SectionHeader, Badge } from "@/components/glass";
import Link from "next/link";
import { GlassButton } from "@/components/glass/GlassButton";
import { Package, UtensilsCrossed, Star, Tag } from "lucide-react";
import { getDashboardStats } from "@/features/dashboard/actions";

export default async function DashboardPage() {
  // Fetch real statistics from database
  const stats = await getDashboardStats();
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Dashboard"
        subtitle="Panoramica della tua cantina"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bottiglie Card */}
        <GlassCard variant="elevated">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Bottiglie
              </h3>
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {stats.bottles.total}
              </p>
            </div>
            <Package className="h-8 w-8 text-[var(--accent-primary)]" />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="readiness">Pronte: {stats.bottles.ready}</Badge>
            <Badge variant="default">
              Invecchiamento: {stats.bottles.aging}
            </Badge>
          </div>
          <Link href="/app/inventory">
            <GlassButton variant="secondary" size="sm" className="w-full">
              Vedi tutte
            </GlassButton>
          </Link>
        </GlassCard>

        {/* Etichette Card */}
        <GlassCard variant="elevated">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Etichette
              </h3>
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {stats.labels.total}
              </p>
            </div>
            <Tag className="h-8 w-8 text-[var(--accent-primary)]" />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="default">
              Aggiunte di recente: {stats.labels.recent}
            </Badge>
          </div>
          <Link href="/app/inventory">
            <GlassButton variant="secondary" size="sm" className="w-full">
              Vedi tutte
            </GlassButton>
          </Link>
        </GlassCard>

        {/* Degustazioni Card */}
        <GlassCard variant="elevated">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Degustazioni
              </h3>
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {stats.tastings.total}
              </p>
            </div>
            <UtensilsCrossed className="h-8 w-8 text-[var(--accent-primary)]" />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {stats.tastings.averageRating > 0 && (
              <Badge variant="rating">
                <Star className="h-3 w-3 mr-1 inline" />
                {stats.tastings.averageRating.toFixed(1)}
              </Badge>
            )}
            <Badge variant="default">
              Questo mese: {stats.tastings.thisMonth}
            </Badge>
          </div>
          <Link href="/app/tastings">
            <GlassButton variant="secondary" size="sm" className="w-full">
              Vedi tutte
            </GlassButton>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}

