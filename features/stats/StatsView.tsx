"use client";

import { GlassCard, Badge } from "@/components/glass";
import type { WineStats } from "./actions";
import { Package, Star, Tag, DollarSign, TrendingUp, Award, BarChart3 } from "lucide-react";
import Link from "next/link";

interface StatsViewProps {
  stats: WineStats;
}

export function WineStatsView({ stats }: StatsViewProps) {
  const normalizeText = (text: string) => {
    return text
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Vini Totali</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.totalWines}
              </p>
            </div>
            <Package className="h-8 w-8 text-[var(--accent-primary)]" />
          </div>
        </GlassCard>

        <GlassCard variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Bottiglie</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.totalBottles}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-[var(--accent-primary)]" />
          </div>
        </GlassCard>

        <GlassCard variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Valutazione Media</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
              </p>
            </div>
            <Star className="h-8 w-8 text-[var(--accent-primary)]" />
          </div>
        </GlassCard>

        <GlassCard variant="elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-muted)] mb-1">Valore Totale</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                €{stats.totalValue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-[var(--accent-primary)]" />
          </div>
        </GlassCard>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wines by Type */}
        <GlassCard variant="elevated">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Vini per Tipo
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.winesByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {normalizeText(type)}
                  </span>
                  <Badge variant="default">{count}</Badge>
                </div>
              ))}
          </div>
        </GlassCard>

        {/* Wines by Country */}
        <GlassCard variant="elevated">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Vini per Paese
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.winesByCountry)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {normalizeText(country)}
                  </span>
                  <Badge variant="default">{count}</Badge>
                </div>
              ))}
          </div>
        </GlassCard>

        {/* Readiness Status */}
        <GlassCard variant="elevated">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Stato Conservazione
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Pronte</span>
              <Badge variant="readiness">{stats.winesByReadiness.ready}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">In invecchiamento</span>
              <Badge variant="default">{stats.winesByReadiness.aging}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Al picco</span>
              <Badge variant="readiness">{stats.winesByReadiness.peak}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Oltre il picco</span>
              <Badge variant="default">{stats.winesByReadiness.past_peak}</Badge>
            </div>
          </div>
        </GlassCard>

        {/* Top Rated Wines */}
        {stats.topRatedWines.length > 0 && (
          <GlassCard variant="elevated">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Vini Più Valutati
            </h3>
            <div className="space-y-3">
              {stats.topRatedWines.map((wine, idx) => (
                <div key={wine.wine_id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="rating">
                        #{idx + 1}
                      </Badge>
                      <Link
                        href={`/app/wine/${wine.wine_id}`}
                        className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                      >
                        {wine.wine_name}
                      </Link>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {wine.count} degustazioni
                    </p>
                  </div>
                  <Badge variant="rating">
                    <Star className="h-3 w-3 mr-1 inline" />
                    {wine.average_rating.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Tastings Timeline */}
      {stats.tastingsByMonth.some((m) => m.count > 0) && (
        <GlassCard variant="elevated">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Degustazioni per Mese (Ultimi 12 mesi)
          </h3>
          <div className="flex items-end gap-2 h-48">
            {stats.tastingsByMonth.map((month, idx) => {
              const maxCount = Math.max(...stats.tastingsByMonth.map((m) => m.count), 1);
              const height = (month.count / maxCount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-[var(--surface-base)] rounded-t" style={{ height: `${height}%` }}>
                    <div className="w-full h-full bg-[var(--accent-primary)] rounded-t" />
                  </div>
                  <div className="text-xs text-[var(--text-muted)] text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                    {month.month}
                  </div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    {month.count}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

