"use client";

import { useState, useRef } from "react";
import { GlassCard, SectionHeader, GlassButton, GlassInput } from "@/components/glass";
import type { ImportReport } from "@/features/backup/schema";

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/backup/export");
      if (!response.ok) {
        throw new Error("Error exporting backup");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cellarwine-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting backup:", error);
      alert("Errore durante l'export del backup");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);
    setImportReport(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const response = await fetch("/api/backup/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error importing backup");
      }

      setImportReport(data.report);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing backup:", error);
      setImportError(
        error instanceof Error ? error.message : "Errore durante l'import del backup"
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Settings"
        subtitle="Impostazioni e backup"
      />

      {/* Export Backup */}
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Export Backup
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Scarica un backup completo dei tuoi dati (vini, degustazioni, movimenti)
          in formato JSON. Puoi usare questo file per ripristinare i tuoi dati in
          un secondo momento.
        </p>
        <GlassButton
          variant="primary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Esportazione in corso..." : "Export Backup JSON"}
        </GlassButton>
      </GlassCard>

      {/* Import Backup */}
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Import Backup
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Carica un file JSON di backup per ripristinare i tuoi dati. I record
          esistenti verranno aggiornati, quelli nuovi verranno creati.
        </p>
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="hidden"
            disabled={importing}
          />
          <GlassButton
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? "Importazione in corso..." : "Scegli file JSON"}
          </GlassButton>
        </div>

        {importError && (
          <div className="mt-4 p-4 rounded-lg bg-[var(--surface-elevated)] border border-[var(--accent-primary)]">
            <p className="text-sm text-[var(--accent-primary)] font-medium">
              Errore: {importError}
            </p>
          </div>
        )}

        {importReport && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Report Import
            </h3>

            {/* Totals */}
            <div className="p-4 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">
                Totale
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Creati:</span>
                  <p className="text-lg font-bold text-green-500">
                    {importReport.total.created}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Aggiornati:</span>
                  <p className="text-lg font-bold text-blue-500">
                    {importReport.total.updated}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Errori:</span>
                  <p className="text-lg font-bold text-[var(--accent-primary)]">
                    {importReport.total.errors}
                  </p>
                </div>
              </div>
            </div>

            {/* Wines */}
            <div className="p-4 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">
                Vini
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Creati:</span>
                  <p className="text-lg font-bold">{importReport.wines.created}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Aggiornati:</span>
                  <p className="text-lg font-bold">{importReport.wines.updated}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Errori:</span>
                  <p className="text-lg font-bold">{importReport.wines.errors}</p>
                </div>
              </div>
            </div>

            {/* Tastings */}
            <div className="p-4 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">
                Degustazioni
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Creati:</span>
                  <p className="text-lg font-bold">
                    {importReport.tastings.created}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Aggiornati:</span>
                  <p className="text-lg font-bold">
                    {importReport.tastings.updated}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Errori:</span>
                  <p className="text-lg font-bold">
                    {importReport.tastings.errors}
                  </p>
                </div>
              </div>
            </div>

            {/* Movements */}
            <div className="p-4 rounded-lg bg-[var(--surface-base)] border border-[var(--border-default)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">
                Movimenti
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-[var(--text-muted)]">Creati:</span>
                  <p className="text-lg font-bold">
                    {importReport.movements.created}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Aggiornati:</span>
                  <p className="text-lg font-bold">
                    {importReport.movements.updated}
                  </p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Errori:</span>
                  <p className="text-lg font-bold">
                    {importReport.movements.errors}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
