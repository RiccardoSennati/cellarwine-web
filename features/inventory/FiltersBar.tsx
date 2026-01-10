"use client";

import { GlassInput, GlassButton } from "@/components/glass";
import { cn } from "@/lib/cn";
import type { WineFilters, WineSort } from "@/types/db";

import { COUNTRIES } from "@/lib/constants/regions";

interface FiltersBarProps {
  filters: WineFilters;
  sort: WineSort;
  onFiltersChange: (filters: WineFilters) => void;
  onSortChange: (sort: WineSort) => void;
  regions: string[];
  vintages: number[];
  countries: string[];
  onReset: () => void;
}

const wineTypes = [
  { value: "red", label: "Rosso" },
  { value: "white", label: "Bianco" },
  { value: "rosé", label: "Rosé" },
  { value: "orange", label: "Orange" },
  { value: "sparkling", label: "Spumante" },
  { value: "champagne", label: "Champagne" },
  { value: "liquor", label: "Liquore" },
];

const sortFields = [
  { value: "name", label: "Nome" },
  { value: "producer", label: "Produttore" },
  { value: "vintage", label: "Annata" },
  { value: "quantity", label: "Quantità" },
  { value: "created_at", label: "Data aggiunta" },
];

export function FiltersBar({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  regions,
  vintages,
  countries,
  onReset,
}: FiltersBarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.wine_type ||
    filters.country ||
    filters.region ||
    filters.vintage;

  return (
    <div className="space-y-4">
      {/* Search */}
      <GlassInput
        label="Cerca"
        placeholder="Nome, produttore, regione..."
        value={filters.search || ""}
        onChange={(e) =>
          onFiltersChange({ ...filters, search: e.target.value || undefined })
        }
      />

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Tipo
          </label>
          <select
            value={filters.wine_type || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                wine_type: (e.target.value || undefined) as any,
              })
            }
            className="w-full rounded-md px-3 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">Tutti</option>
            {wineTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Paese
          </label>
          <select
            value={filters.country || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                country: e.target.value || undefined,
              })
            }
            className="w-full rounded-md px-3 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">Tutti</option>
            {countries.map((country) => {
              const countryLabel = COUNTRIES.find((c) => c.value === country)?.label || country;
              return (
                <option key={country} value={country}>
                  {countryLabel}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Regione
          </label>
          <select
            value={filters.region || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                region: e.target.value || undefined,
              })
            }
            className="w-full rounded-md px-3 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">Tutte</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Annata
          </label>
          <select
            value={filters.vintage?.toString() || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                vintage: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full rounded-md px-3 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            <option value="">Tutte</option>
            {vintages.map((vintage) => (
              <option key={vintage} value={vintage}>
                {vintage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Ordina per
          </label>
          <div className="flex gap-2">
            <select
              value={sort.field}
              onChange={(e) =>
                onSortChange({
                  ...sort,
                  field: e.target.value as any,
                })
              }
              className="flex-1 rounded-md px-3 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            >
              {sortFields.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                onSortChange({
                  ...sort,
                  order: sort.order === "asc" ? "desc" : "asc",
                })
              }
              className="px-3 py-2 rounded-md bg-[var(--surface-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              title={sort.order === "asc" ? "Crescente" : "Decrescente"}
            >
              {sort.order === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div>
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={onReset}
          >
            Reset filtri
          </GlassButton>
        </div>
      )}
    </div>
  );
}

