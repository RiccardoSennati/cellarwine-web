"use client";

import { GlassCard, GlassButton } from "@/components/glass";
import type { Wine, Tasting } from "@/types/db";
import { useState } from "react";

interface ExportTabProps {
  wine: Wine;
  tastings: Tasting[];
}

export function ExportTab({ wine, tastings }: ExportTabProps) {
  const [downloadingWine, setDownloadingWine] = useState(false);
  const [downloadingTasting, setDownloadingTasting] = useState<string | null>(null);

  const handleDownloadWinePDF = async () => {
    setDownloadingWine(true);
    try {
      const response = await fetch(`/api/pdf/wine/${wine.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      const blob = await response.blob();
      
      // Check if blob is actually a PDF
      if (blob.type !== "application/pdf" && blob.size === 0) {
        throw new Error("Il PDF generato è vuoto o non valido");
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wine-${wine.name.replace(/[^a-z0-9]/gi, "-")}-${wine.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading wine PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto";
      alert(`Errore durante il download del PDF: ${errorMessage}`);
    } finally {
      setDownloadingWine(false);
    }
  };

  const handleDownloadTastingPDF = async (tastingId: string) => {
    setDownloadingTasting(tastingId);
    try {
      const response = await fetch(`/api/pdf/tasting/${tastingId}`);
      if (!response.ok) {
        throw new Error("Error generating PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const tasting = tastings.find((t) => t.id === tastingId);
      const dateStr = tasting
        ? new Date(tasting.tasting_date).toLocaleDateString("it-IT").replace(/[^a-z0-9]/gi, "-")
        : tastingId;
      a.download = `tasting-${wine.name.replace(/[^a-z0-9]/gi, "-")}-${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading tasting PDF:", error);
      alert("Errore durante il download del PDF");
    } finally {
      setDownloadingTasting(null);
    }
  };

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
        Export PDF
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Vino
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Scarica un PDF con tutte le informazioni del vino, incluso un QR code
            per accedere rapidamente alla pagina.
          </p>
          <GlassButton
            variant="primary"
            onClick={handleDownloadWinePDF}
            disabled={downloadingWine}
          >
            {downloadingWine ? "Generazione in corso..." : "Download Wine PDF"}
          </GlassButton>
        </div>

        {tastings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Degustazioni
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Scarica i PDF delle singole degustazioni.
            </p>
            <div className="space-y-2">
              {tastings.map((tasting) => (
                <div
                  key={tasting.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)]"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {new Date(tasting.tasting_date).toLocaleDateString("it-IT")}
                    </p>
                    {tasting.rating && (
                      <p className="text-xs text-[var(--text-secondary)]">
                        Valutazione: {tasting.rating}/100
                      </p>
                    )}
                  </div>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadTastingPDF(tasting.id)}
                    disabled={downloadingTasting === tasting.id}
                  >
                    {downloadingTasting === tasting.id
                      ? "Generazione..."
                      : "Download PDF"}
                  </GlassButton>
                </div>
              ))}
            </div>
          </div>
        )}

        {tastings.length === 0 && (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <p>Nessuna degustazione disponibile per l&apos;export.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

