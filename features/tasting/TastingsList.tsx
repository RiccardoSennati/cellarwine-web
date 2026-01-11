"use client";

import { GlassCard, Badge } from "@/components/glass";
import { GlassButton } from "@/components/glass/GlassButton";
import type { Tasting } from "@/types/db";
import { Star, Calendar, MapPin, Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteTasting } from "./actions";

interface TastingsListProps {
  tastings: Array<Tasting & { wine_name: string; wine_producer: string | null }>;
}

export function TastingsList({ tastings }: TastingsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRating = (rating: number | null) => {
    if (!rating) return null;
    // Convert 0-100 to 0-5 scale
    return (rating / 20).toFixed(1);
  };

  const handleDelete = async (tastingId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa degustazione?")) {
      return;
    }

    try {
      setDeletingId(tastingId);
      await deleteTasting(tastingId);
      router.refresh();
    } catch (error) {
      console.error("Error deleting tasting:", error);
      alert("Errore durante l'eliminazione della degustazione");
    } finally {
      setDeletingId(null);
    }
  };

  if (tastings.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuna degustazione registrata.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Aggiungi una degustazione dalla pagina di dettaglio di un vino.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {tastings.map((tasting) => (
        <GlassCard key={tasting.id} variant="elevated">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Wine info */}
              <div className="mb-3">
                <Link
                  href={`/app/wine/${tasting.wine_id}`}
                  className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                >
                  {tasting.wine_name}
                </Link>
                {tasting.wine_producer && (
                  <p className="text-sm text-[var(--text-muted)]">
                    {tasting.wine_producer}
                  </p>
                )}
              </div>

              {/* Tasting info */}
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(tasting.tasting_date)}</span>
                </div>
                {tasting.location && (
                  <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    <MapPin className="h-4 w-4" />
                    <span>{tasting.location}</span>
                  </div>
                )}
                {tasting.rating && (
                  <Badge variant="rating">
                    <Star className="h-3 w-3 mr-1 inline" />
                    {formatRating(tasting.rating)}
                  </Badge>
                )}
                {tasting.occasion && (
                  <Badge variant="default">{tasting.occasion}</Badge>
                )}
              </div>

              {/* Aromatic families */}
              {tasting.aromatic_families && tasting.aromatic_families.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tasting.aromatic_families.slice(0, 5).map((family, idx) => (
                    <Badge key={idx} variant="default">
                      {family}
                    </Badge>
                  ))}
                  {tasting.aromatic_families.length > 5 && (
                    <Badge variant="default">
                      +{tasting.aromatic_families.length - 5}
                    </Badge>
                  )}
                </div>
              )}

              {/* Notes preview */}
              {tasting.overall_notes && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {tasting.overall_notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link href={`/app/wine/${tasting.wine_id}/tasting/${tasting.id}/edit`}>
                <GlassButton variant="secondary" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifica
                </GlassButton>
              </Link>
              <Link href={`/app/wine/${tasting.wine_id}`}>
                <GlassButton variant="secondary" size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Vino
                </GlassButton>
              </Link>
              <GlassButton
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(tasting.id)}
                disabled={deletingId === tasting.id}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {deletingId === tasting.id ? "Eliminazione..." : "Elimina"}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

