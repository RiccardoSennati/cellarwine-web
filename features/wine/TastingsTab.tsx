"use client";

import { GlassCard, GlassButton, Badge } from "@/components/glass";
import type { Tasting } from "@/types/db";
import Link from "next/link";

interface TastingsTabProps {
  wineId: string;
  tastings: Tasting[];
}

export function TastingsTab({ wineId, tastings }: TastingsTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Degustazioni ({tastings.length})
        </h2>
        <div className="flex gap-2">
          <Link href={`/app/wine/${wineId}/tasting/new`}>
            <GlassButton variant="primary" size="sm">
              + Nuova Degustazione
            </GlassButton>
          </Link>
        </div>
      </div>

      {tastings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuna degustazione registrata per questo vino.
          </p>
          <Link href={`/app/wine/${wineId}/tasting/new`}>
            <GlassButton variant="primary" size="sm">
              Aggiungi la prima degustazione
            </GlassButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tastings.map((tasting) => (
            <div
              key={tasting.id}
              className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] backdrop-blur-[var(--glass-blur)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {formatDate(tasting.tasting_date)}
                    </h3>
                    {tasting.rating && (
                      <Badge variant="rating">
                        ⭐ {tasting.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  {tasting.occasion && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      Occasione: {tasting.occasion}
                    </p>
                  )}
                  {tasting.location && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      Luogo: {tasting.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/app/wine/${wineId}/tasting/${tasting.id}/edit`}>
                    <GlassButton variant="secondary" size="sm">
                      Modifica
                    </GlassButton>
                  </Link>
                  <Link href={`/app/wine/${wineId}/tasting/new?duplicate=${tasting.id}`}>
                    <GlassButton variant="secondary" size="sm">
                      Duplica
                    </GlassButton>
                  </Link>
                </div>
              </div>

              {tasting.overall_notes && (
                <p className="text-sm text-[var(--text-secondary)] mt-2 whitespace-pre-wrap">
                  {tasting.overall_notes}
                </p>
              )}

              {((tasting.aromatic_families?.length ?? 0) > 0 ||
                (tasting.textures?.length ?? 0) > 0 ||
                (tasting.faults?.length ?? 0) > 0) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tasting.aromatic_families?.map((family, idx) => (
                      <Badge key={idx} variant="default">
                        {family}
                      </Badge>
                    ))}
                    {tasting.textures?.map((texture, idx) => (
                      <Badge key={idx} variant="default">
                        {texture}
                      </Badge>
                    ))}
                    {tasting.faults?.map((fault, idx) => (
                      <Badge key={idx} variant="readiness">
                        {fault}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

