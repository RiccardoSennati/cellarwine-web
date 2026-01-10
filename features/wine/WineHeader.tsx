import { GlassCard, Badge } from "@/components/glass";
import type { Wine } from "@/types/db";
import Link from "next/link";
import { GlassButton } from "@/components/glass/GlassButton";

interface WineHeaderProps {
  wine: Wine;
}

const wineTypeLabels: Record<string, string> = {
  red: "Rosso",
  white: "Bianco",
  "rosé": "Rosé",
  sparkling: "Spumante",
  dessert: "Dolce",
  fortified: "Liquoroso",
};

export function WineHeader({ wine }: WineHeaderProps) {
  return (
    <GlassCard variant="elevated">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                {wine.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {wine.producer && (
                  <span className="text-lg text-[var(--text-secondary)]">
                    {wine.producer}
                  </span>
                )}
                {wine.vintage && (
                  <span className="text-lg text-[var(--text-secondary)]">
                    {wine.vintage}
                  </span>
                )}
                {wine.wine_type && (
                  <Badge variant="default">
                    {wineTypeLabels[wine.wine_type] || wine.wine_type}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)]">
                {wine.region && (
                  <span>
                    <strong className="text-[var(--text-secondary)]">Regione:</strong>{" "}
                    {wine.region}
                  </span>
                )}
                {wine.country && (
                  <span>
                    <strong className="text-[var(--text-secondary)]">Paese:</strong>{" "}
                    {wine.country}
                  </span>
                )}
                {wine.appellation && (
                  <span>
                    <strong className="text-[var(--text-secondary)]">Denominazione:</strong>{" "}
                    {wine.appellation}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-sm text-[var(--text-muted)]">Quantità</span>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {wine.quantity}
              </p>
            </div>
            {wine.price && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Prezzo</span>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {wine.price.toFixed(2)} {wine.currency || "EUR"}
                </p>
              </div>
            )}
            {wine.location && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Posizione</span>
                <p className="text-lg text-[var(--text-primary)]">
                  {wine.location}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/app/inventory">
            <GlassButton variant="secondary" size="sm">
              ← Torna all'inventory
            </GlassButton>
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

