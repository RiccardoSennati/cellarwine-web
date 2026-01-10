"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassButton, Badge } from "@/components/glass";
import {
  DashboardTable,
  DashboardTableHeader,
  DashboardTableBody,
  DashboardTableRow,
  DashboardTableHead,
  DashboardTableCell,
} from "@/components/dashboard/DashboardTable";
import { cn } from "@/lib/cn";
import { COUNTRIES } from "@/lib/constants/regions";
import type { Wine } from "@/types/db";
import { Edit, Trash2, Wine as WineIcon } from "lucide-react";

interface WineTableProps {
  wines: Wine[];
  onEdit: (wine: Wine) => void;
  onDelete: (id: string) => void;
  onDrink: (id: string) => void;
}

const wineTypeLabels: Record<string, string> = {
  red: "Rosso",
  white: "Bianco",
  "rosé": "Rosé",
  orange: "Orange",
  sparkling: "Spumante",
  champagne: "Champagne",
  liquor: "Liquore",
};

const countryLabels: Record<string, string> = {
  italia: "Italia",
  francia: "Francia",
  germania: "Germania",
  austria: "Austria",
  usa: "USA",
  argentina: "Argentina",
  "resto-del-mondo": "Resto del Mondo",
};


export function WineTable({
  wines,
  onEdit,
  onDelete,
  onDrink,
}: WineTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [drinkingId, setDrinkingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo vino?")) {
      return;
    }
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDrink = async (id: string) => {
    if (!confirm("Registrare il consumo di una bottiglia?")) {
      return;
    }
    setDrinkingId(id);
    try {
      await onDrink(id);
    } finally {
      setDrinkingId(null);
    }
  };

  return (
    <DashboardTable>
      <DashboardTableHeader>
        <DashboardTableRow>
          <DashboardTableHead>Nome</DashboardTableHead>
          <DashboardTableHead>Produttore</DashboardTableHead>
          <DashboardTableHead>Annata</DashboardTableHead>
          <DashboardTableHead>Tipo</DashboardTableHead>
          <DashboardTableHead>Paese</DashboardTableHead>
          <DashboardTableHead>Regione</DashboardTableHead>
          <DashboardTableHead>Quantità</DashboardTableHead>
          <DashboardTableHead className="text-right">Azioni</DashboardTableHead>
        </DashboardTableRow>
      </DashboardTableHeader>
      <DashboardTableBody>
        {wines.map((wine) => {
          const grapes = Array.isArray(wine.grapes) ? wine.grapes : [];
          const grapesText = grapes.length > 0
            ? grapes.map((g: any) => typeof g === "string" ? g : g.name).join(", ")
            : null;

          return (
            <DashboardTableRow
              key={wine.id}
              onClick={() => window.location.href = `/app/wine/${wine.id}`}
            >
              <DashboardTableCell>
                <Link
                  href={`/app/wine/${wine.id}`}
                  className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {wine.name}
                </Link>
                {wine.location && (
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Posizione: {wine.location}
                  </div>
                )}
                {grapesText && (
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Uvaggi: {grapesText}
                  </div>
                )}
              </DashboardTableCell>
              <DashboardTableCell className="text-[var(--text-secondary)]">
                {wine.producer || "-"}
              </DashboardTableCell>
              <DashboardTableCell className="text-[var(--text-secondary)]">
                {wine.vintage || "-"}
              </DashboardTableCell>
              <DashboardTableCell>
                {wine.wine_type && (
                  <Badge variant="default">
                    {wineTypeLabels[wine.wine_type] || wine.wine_type}
                  </Badge>
                )}
              </DashboardTableCell>
              <DashboardTableCell className="text-[var(--text-secondary)]">
                {wine.country ? (countryLabels[wine.country] || wine.country) : "-"}
              </DashboardTableCell>
              <DashboardTableCell className="text-[var(--text-secondary)]">
                {wine.region || "-"}
              </DashboardTableCell>
              <DashboardTableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--text-primary)]">
                    {wine.quantity}
                  </span>
                  {wine.quantity > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDrink(wine.id);
                      }}
                      disabled={drinkingId === wine.id}
                      title="Registra consumo"
                      className="p-1 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors disabled:opacity-50"
                    >
                      <WineIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </DashboardTableCell>
              <DashboardTableCell>
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEdit(wine)}
                    className="p-2 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    title="Modifica"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(wine.id)}
                    disabled={deletingId === wine.id}
                    className="p-2 rounded hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors disabled:opacity-50"
                    title="Elimina"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </DashboardTableCell>
            </DashboardTableRow>
          );
        })}
      </DashboardTableBody>
    </DashboardTable>
  );
}

