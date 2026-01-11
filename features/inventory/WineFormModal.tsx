"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wineFormSchema, type WineFormSchema } from "./schema";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { GlassInput, GlassButton, GlassTextarea } from "@/components/glass";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GrapesMultiSelect } from "@/components/wine/GrapesMultiSelect";
import { COUNTRIES, getRegionsForCountry, hasRegionSelect, hasRegionInput } from "@/lib/constants/regions";
import { cn } from "@/lib/cn";
import type { Wine, Grape } from "@/types/db";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface WineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  wine?: Wine | null;
  onSubmit: (data: WineFormSchema) => Promise<void>;
}

const WINE_TYPES = [
  { value: "red", label: "Rosso" },
  { value: "white", label: "Bianco" },
  { value: "rosé", label: "Rosé" },
  { value: "orange", label: "Orange" },
  { value: "sparkling", label: "Spumante" },
  { value: "champagne", label: "Champagne" },
  { value: "liquor", label: "Liquore" },
] as const;

export function WineFormModal({
  isOpen,
  onClose,
  wine,
  onSubmit,
}: WineFormModalProps) {
  const [labelPreview, setLabelPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(wineFormSchema),
    defaultValues: {
      name: "",
      producer: "",
      wine_type: "red",
      country: "italia",
      quantity: 0,
      grapes: [],
      currency: "EUR",
    },
  });

  const selectedCountry = watch("country");
  const selectedRegion = watch("region");
  const grapes = watch("grapes") || [];

  // Reset region when country changes
  useEffect(() => {
    if (selectedCountry) {
      setValue("region", null);
    }
  }, [selectedCountry, setValue]);

  // Load wine data on edit
  useEffect(() => {
    if (wine) {
      const grapesData: Grape[] = (wine.grapes || []).map((g: any) => ({
        name: typeof g === "string" ? g : g.name || "",
        percent: typeof g === "object" && g.percent ? g.percent : undefined,
      }));

      reset({
        name: wine.name,
        producer: wine.producer || "",
        vintage: wine.vintage || null,
        wine_type: wine.wine_type || "red",
        country: (wine.country as any) || "italia",
        region: wine.region || null,
        grapes: grapesData,
        abv: wine.abv || null,
        quantity: wine.quantity,
        price: wine.price || null,
        currency: wine.currency || "EUR",
        location: wine.location || null,
        label_image_path: wine.label_image_path || wine.label_image_url || null,
        label_image_url: wine.label_image_url || null,
        story: wine.story || null,
        notes: wine.notes || null,
      });

      // Set preview if image exists
      if (wine.label_image_path || wine.label_image_url) {
        setLabelPreview(wine.label_image_path || wine.label_image_url || null);
      }
    } else {
      reset({
        name: "",
        producer: "",
        wine_type: "red",
        country: "italia",
        quantity: 0,
        grapes: [],
        currency: "EUR",
      });
      setLabelPreview(null);
    }
  }, [wine, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: WineFormSchema) => {
    try {
      await onSubmit(data);
      reset();
      setLabelPreview(null);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB) - compress or reject if too large
    if (file.size > 5 * 1024 * 1024) {
      alert("L'immagine deve essere inferiore a 5MB. Si prega di ridurre la dimensione.");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLabelPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // For new wines, store the file temporarily and upload after wine creation
    // For existing wines, upload immediately
    if (!wine?.id) {
      // New wine: store file in state, will upload after wine creation
      setLabelPreview(reader.result as string);
      // Store the file for later upload
      (e.target as any).dataset.tempFile = JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
      });
      setValue("label_image_path", "pending-upload");
      return;
    }

    // Existing wine: upload directly to Supabase Storage from client (bypasses Next.js limits)
    setUploading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Generate unique filename with user_id prefix for RLS policies
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${wine.id}/${Date.now()}.${fileExt}`;

      // Upload directly to Supabase Storage (no Next.js body size limit)
      const { error: uploadError } = await supabase.storage
        .from("labels")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("labels").getPublicUrl(filePath);

      // Update wine record via Server Action
      const { updateWineLabel } = await import("@/features/wine/actions");
      await updateWineLabel(wine.id, filePath, publicUrl);

      setValue("label_image_url", publicUrl);
      setValue("label_image_path", filePath);
      setLabelPreview(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore nel caricamento dell'immagine"
      );
      setLabelPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const regions = getRegionsForCountry(selectedCountry);
  const showRegionSelect = hasRegionSelect(selectedCountry);
  const showRegionInput = hasRegionInput(selectedCountry);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DashboardCard
          title={wine ? "Modifica Vino" : "Aggiungi Vino"}
          description={wine ? "Modifica le informazioni del vino" : "Inserisci le informazioni del nuovo vino"}
          className="relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" />
          </button>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Nome e Produttore */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassInput
                label="Nome *"
                {...register("name")}
                error={errors.name?.message}
              />
              <GlassInput
                label="Produttore *"
                {...register("producer")}
                error={errors.producer?.message}
              />
            </div>

            {/* Annata, Tipo, Quantità */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassInput
                label="Annata"
                type="number"
                {...register("vintage", { valueAsNumber: true })}
                error={errors.vintage?.message}
                placeholder="es. 2020"
              />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Tipo * <span className="text-[var(--accent-primary)]">*</span>
                </label>
                <Controller
                  name="wine_type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger error={errors.wine_type?.message}>
                        <SelectValue placeholder="Seleziona tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {WINE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.wine_type && (
                  <p className="mt-1 text-sm text-[var(--accent-primary)]">{errors.wine_type.message}</p>
                )}
              </div>
              <GlassInput
                label="Quantità *"
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                error={errors.quantity?.message}
                min={0}
              />
            </div>

            {/* Paese e Regione (dinamica) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Paese * <span className="text-[var(--accent-primary)]">*</span>
                </label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger error={errors.country?.message}>
                        <SelectValue placeholder="Seleziona paese..." />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-[var(--accent-primary)]">{errors.country.message}</p>
                )}
              </div>

              {showRegionSelect && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Regione
                  </label>
                  <Controller
                    name="region"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={(val) => field.onChange(val || null)}>
                        <SelectTrigger error={errors.region?.message}>
                          <SelectValue placeholder="Seleziona regione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.region && (
                    <p className="mt-1 text-sm text-[var(--accent-primary)]">{errors.region.message}</p>
                  )}
                </div>
              )}

              {showRegionInput && (
                <GlassInput
                  label="Stato/Area"
                  {...register("region")}
                  error={errors.region?.message}
                  placeholder="es. Australia, Sudafrica, Cile..."
                />
              )}

              {!showRegionSelect && !showRegionInput && (
                <div className="text-sm text-[var(--text-muted)] flex items-center">
                  Nessuna regione disponibile per questo paese
                </div>
              )}
            </div>

            {/* Uvaggi con percentuali */}
            <Controller
              name="grapes"
              control={control}
              render={({ field }) => (
                <GrapesMultiSelect
                  grapes={field.value || []}
                  onChange={field.onChange}
                  error={errors.grapes?.message || errors.grapes?.root?.message}
                />
              )}
            />

            {/* Grado alcolico, Prezzo, Posizione */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassInput
                label="Grado alcolico (%)"
                type="number"
                step="0.1"
                min="0"
                max="20"
                {...register("abv", { valueAsNumber: true })}
                error={errors.abv?.message}
                placeholder="es. 13.5"
              />
              <GlassInput
                label="Prezzo"
                type="number"
                step="0.01"
                min="0"
                {...register("price", { valueAsNumber: true })}
                error={errors.price?.message}
                placeholder="es. 25.00"
              />
              <GlassInput
                label="Posizione"
                {...register("location")}
                error={errors.location?.message}
                placeholder="es. Scaffale A / Ripiano 2"
              />
            </div>

            {/* Etichetta (Upload) */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Etichetta
              </label>
              {labelPreview && (
                <div className="relative mb-3 w-32 h-32 rounded-lg overflow-hidden border border-[var(--border-default)]">
                  <img
                    src={labelPreview}
                    alt="Preview etichetta"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLabelPreview(null);
                      setValue("label_image_path", null);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] hover:bg-[var(--surface-hover)] cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">
                  {uploading ? "Caricamento..." : labelPreview ? "Cambia immagine" : "Carica etichetta"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <input type="hidden" {...register("label_image_path")} />
            </div>

            {/* Storia */}
            <GlassTextarea
              label="Storia"
              {...register("story")}
              error={errors.story?.message}
              rows={4}
              placeholder="Storia del vino o della cantina..."
            />

            {/* Note */}
            <GlassTextarea
              label="Note"
              {...register("notes")}
              error={errors.notes?.message}
              rows={3}
              placeholder="Note personali..."
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[var(--border-default)]">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annulla
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                disabled={isSubmitting || uploading}
              >
                {isSubmitting
                  ? "Salvataggio..."
                  : wine
                    ? "Salva modifiche"
                    : "Aggiungi vino"}
              </GlassButton>
            </div>
          </form>
        </DashboardCard>
      </div>
    </div>
  );
}
