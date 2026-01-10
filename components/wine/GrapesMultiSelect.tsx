"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GlassButton, GlassInput } from "@/components/glass";
import { cn } from "@/lib/cn";
import { UNIQUE_GRAPES } from "@/lib/constants/grapes";
import type { Grape } from "@/types/db";
import { Search, X } from "lucide-react";

interface GrapesMultiSelectProps {
    grapes: Grape[];
    onChange: (grapes: Grape[]) => void;
    error?: string;
}

export function GrapesMultiSelect({ grapes, onChange, error }: GrapesMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredGrapes = UNIQUE_GRAPES.filter((grape) =>
        grape.toLowerCase().includes(search.toLowerCase())
    );

    const toggleGrape = (grapeName: string) => {
        const existingIndex = grapes.findIndex((g) => g.name === grapeName);
        if (existingIndex >= 0) {
            // Rimuovi
            onChange(grapes.filter((_, i) => i !== existingIndex));
        } else {
            // Aggiungi
            onChange([...grapes, { name: grapeName }]);
        }
    };

    const removeGrape = (index: number) => {
        onChange(grapes.filter((_, i) => i !== index));
    };

    const updatePercent = (index: number, percent: number | null) => {
        const updated = [...grapes];
        if (percent === null || percent === 0 || isNaN(percent)) {
            updated[index] = { name: updated[index].name };
        } else {
            updated[index] = { ...updated[index], percent };
        }
        onChange(updated);
    };

    const selectedGrapeNames = grapes.map((g) => g.name);
    const hasPercentages = grapes.some((g) => g.percent !== undefined && g.percent !== null);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Uvaggi
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "flex h-10 w-full items-center justify-between rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] px-3 py-2 text-sm",
                                "placeholder:text-[var(--text-muted)]",
                                "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2",
                                "hover:bg-[var(--surface-hover)]",
                                error && "border-[var(--accent-primary)]"
                            )}
                        >
                            <span className={cn("truncate", selectedGrapeNames.length === 0 && "text-[var(--text-muted)]")}>
                                {selectedGrapeNames.length === 0
                                    ? "Seleziona uvaggi..."
                                    : `${selectedGrapeNames.length} uvaggio/i selezionato/i`}
                            </span>
                            <Search className="h-4 w-4 opacity-50" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-2 border-b border-[var(--border-default)]">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Cerca uvaggio..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {filteredGrapes.length === 0 ? (
                                <div className="py-6 text-center text-sm text-[var(--text-muted)]">
                                    Nessun uvaggio trovato
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredGrapes.map((grape) => (
                                        <div
                                            key={grape}
                                            className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-[var(--surface-hover)] cursor-pointer"
                                            onClick={() => toggleGrape(grape)}
                                        >
                                            <Checkbox
                                                checked={selectedGrapeNames.includes(grape)}
                                                onCheckedChange={() => toggleGrape(grape)}
                                            />
                                            <label className="flex-1 text-sm text-[var(--text-primary)] cursor-pointer">
                                                {grape}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
                {error && <p className="mt-1 text-sm text-[var(--accent-primary)]">{error}</p>}
            </div>

            {/* Lista uvaggi selezionati con percentuali */}
            {grapes.length > 0 && (
                <div className="space-y-3">
                    <div className="text-sm font-medium text-[var(--text-secondary)]">
                        Percentuali (opzionale - somma deve essere 100%)
                    </div>
                    <div className="space-y-2">
                        {grapes.map((grape, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-md border border-[var(--border-default)] bg-[var(--surface-base)]">
                                <div className="flex-1">
                                    <span className="text-sm font-medium text-[var(--text-primary)]">{grape.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="%"
                                        value={grape.percent || ""}
                                        onChange={(e) => {
                                            const value = e.target.value === "" ? null : parseFloat(e.target.value);
                                            updatePercent(index, value);
                                        }}
                                        className="w-20 rounded-md border border-[var(--border-default)] bg-[var(--surface-base)] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    />
                                    <span className="text-sm text-[var(--text-muted)]">%</span>
                                    <button
                                        type="button"
                                        onClick={() => removeGrape(index)}
                                        className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {hasPercentages && (
                            <div className="pt-2 border-t border-[var(--border-default)]">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--text-secondary)]">Totale:</span>
                                    <span
                                        className={cn(
                                            "font-medium",
                                            (() => {
                                                const total = grapes.reduce((sum, g) => sum + (g.percent || 0), 0);
                                                if (total >= 99 && total <= 101) return "text-green-500";
                                                return "text-[var(--accent-primary)]";
                                            })()
                                        )}
                                    >
                                        {grapes.reduce((sum, g) => sum + (g.percent || 0), 0).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

