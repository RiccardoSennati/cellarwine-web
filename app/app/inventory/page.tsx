"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GlassButton } from "@/components/glass";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { FiltersBar } from "@/features/inventory/FiltersBar";
import { WineTable } from "@/features/inventory/WineTable";
import { WineFormModal } from "@/features/inventory/WineFormModal";
import {
  getWines,
  createWine,
  updateWine,
  deleteWine,
  drinkWine,
  getUniqueRegions,
  getUniqueVintages,
  getUniqueCountries,
} from "@/features/inventory/actions";
import type { Wine, WineFilters, WineSort } from "@/types/db";
import type { WineFormSchema } from "@/features/inventory/schema";
import { Plus } from "lucide-react";

export default function InventoryPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [wines, setWines] = useState<Wine[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [vintages, setVintages] = useState<number[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [filters, setFilters] = useState<WineFilters>({});
  const [sort, setSort] = useState<WineSort>({
    field: "created_at",
    order: "desc",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);

  // Load wines and filter options
  useEffect(() => {
    loadData();
  }, [filters, sort]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [winesData, regionsData, vintagesData, countriesData] = await Promise.all([
        getWines({
          search: filters.search,
          wine_type: filters.wine_type,
          country: filters.country as string | undefined,
          region: filters.region,
          vintage: filters.vintage,
          sortBy: sort.field,
          sortOrder: sort.order,
        }),
        getUniqueRegions(),
        getUniqueVintages(),
        getUniqueCountries(),
      ]);

      setWines(winesData as Wine[]);
      setRegions(regionsData);
      setVintages(vintagesData);
      setCountries(countriesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWine = async (data: WineFormSchema) => {
    try {
      await createWine(data);
      router.refresh();
      loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating wine:", error);
      throw error;
    }
  };

  const handleUpdateWine = async (data: WineFormSchema) => {
    if (!editingWine) return;
    try {
      await updateWine(editingWine.id, data);
      router.refresh();
      loadData();
      setIsModalOpen(false);
      setEditingWine(null);
    } catch (error) {
      console.error("Error updating wine:", error);
      throw error;
    }
  };

  const handleDeleteWine = async (id: string) => {
    try {
      await deleteWine(id);
      router.refresh();
      loadData();
    } catch (error) {
      console.error("Error deleting wine:", error);
      throw error;
    }
  };

  const handleDrinkWine = async (id: string) => {
    try {
      await drinkWine(id);
      router.refresh();
      loadData();
    } catch (error) {
      console.error("Error drinking wine:", error);
      throw error;
    }
  };

  const handleEdit = (wine: Wine) => {
    setEditingWine(wine);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingWine(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWine(null);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Filtri e Ricerca"
        description="Filtra e ordina i tuoi vini"
      >
        <FiltersBar
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          regions={regions}
          vintages={vintages}
          countries={countries}
          onReset={handleResetFilters}
        />
      </DashboardCard>

      <DashboardCard
        title="Inventory"
        description={`${wines.length} vino/i in cantina`}
        actions={
          <GlassButton variant="primary" onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Vino
          </GlassButton>
        }
      >
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">Caricamento...</p>
          </div>
        ) : wines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)] mb-4">Nessun vino trovato</p>
            <GlassButton variant="primary" onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi il primo vino
            </GlassButton>
          </div>
        ) : (
          <WineTable
            wines={wines}
            onEdit={handleEdit}
            onDelete={handleDeleteWine}
            onDrink={handleDrinkWine}
          />
        )}
      </DashboardCard>

      <WineFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        wine={editingWine}
        onSubmit={editingWine ? handleUpdateWine : handleCreateWine}
      />
    </div>
  );
}
