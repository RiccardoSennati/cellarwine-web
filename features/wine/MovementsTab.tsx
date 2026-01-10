"use client";

import { GlassCard } from "@/components/glass";
import type { Movement } from "@/types/db";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Wine, Gift, Euro, Package } from "lucide-react";

interface MovementsTabProps {
  movements: Movement[];
}

const movementTypeLabels: Record<string, string> = {
  in: "Entrata",
  out: "Uscita",
  transfer: "Trasferimento",
  consumed: "Consumato",
  gift: "Regalo",
  sold: "Venduto",
};

const movementIcons: Record<string, React.ReactNode> = {
  in: <ArrowDownToLine className="h-4 w-4" />,
  out: <ArrowUpFromLine className="h-4 w-4" />,
  transfer: <RefreshCw className="h-4 w-4" />,
  consumed: <Wine className="h-4 w-4" />,
  gift: <Gift className="h-4 w-4" />,
  sold: <Euro className="h-4 w-4" />,
};

export function MovementsTab({ movements }: MovementsTabProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
        Movimenti ({movements.length})
      </h2>

      {movements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">
            Nessun movimento registrato per questo vino.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border-default)]" />

          <div className="space-y-6">
            {movements.map((movement, index) => (
              <div key={movement.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-[var(--surface-elevated)] border-2 border-[var(--border-default)] flex items-center justify-center">
                  <span className="text-[var(--text-secondary)]">
                    {movementIcons[movement.movement_type] || <Package className="h-4 w-4" />}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] backdrop-blur-[var(--glass-blur)]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                        {movementTypeLabels[movement.movement_type] ||
                          movement.movement_type}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {formatDate(movement.movement_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {movement.quantity > 0 ? "+" : ""}
                        {movement.quantity}
                      </p>
                      {movement.price && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          {movement.price.toFixed(2)} {movement.currency || "EUR"}
                        </p>
                      )}
                    </div>
                  </div>

                  {(movement.from_location || movement.to_location) && (
                    <div className="text-sm text-[var(--text-secondary)] mb-2">
                      {movement.from_location && (
                        <span>
                          Da: <strong>{movement.from_location}</strong>
                        </span>
                      )}
                      {movement.from_location && movement.to_location && " → "}
                      {movement.to_location && (
                        <span>
                          A: <strong>{movement.to_location}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {(movement.source || movement.destination) && (
                    <div className="text-sm text-[var(--text-secondary)] mb-2">
                      {movement.source && (
                        <span>
                          Fonte: <strong>{movement.source}</strong>
                        </span>
                      )}
                      {movement.source && movement.destination && " → "}
                      {movement.destination && (
                        <span>
                          Destinazione: <strong>{movement.destination}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {movement.notes && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2 whitespace-pre-wrap">
                      {movement.notes}
                    </p>
                  )}

                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    Registrato il {formatDateTime(movement.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

