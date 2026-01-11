"use client";

import { useState, useRef } from "react";
import { GlassCard, GlassInput, GlassTextarea, GlassButton } from "@/components/glass";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wineFormSchema, type WineFormSchema } from "@/features/inventory/schema";
import { updateWine } from "@/features/inventory/actions";
import { deleteLabelImage } from "./actions";
import { GrapesMultiSelect } from "@/components/wine/GrapesMultiSelect";
import type { Wine, Grape } from "@/types/db";
import Image from "next/image";

interface WineDetailsTabProps {
  wine: Wine;
  onUpdate: () => void;
}

export function WineDetailsTab({ wine, onUpdate }: WineDetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    wine.label_image_url
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(wineFormSchema),
    defaultValues: {
      name: wine.name,
      producer: wine.producer || undefined,
      vintage: wine.vintage || undefined,
      wine_type: wine.wine_type || undefined,
      region: wine.region || undefined,
      country: wine.country || undefined,
      appellation: wine.appellation || undefined,
      quantity: wine.quantity,
      price: wine.price || undefined,
      currency: wine.currency || undefined,
      location: wine.location || undefined,
      cellar_location: wine.cellar_location || undefined,
      readiness_status: wine.readiness_status || undefined,
      drink_from: wine.drink_from || undefined,
      drink_until: wine.drink_until || undefined,
      grapes: Array.isArray(wine.grapes)
        ? wine.grapes.map((g: any) => ({
            name: typeof g === "string" ? g : g.name || "",
            percent: typeof g === "object" && g.percent ? g.percent : undefined,
          }))
        : [],
      story: wine.story || undefined,
      notes: wine.notes || undefined,
      label_image_url: wine.label_image_url || undefined,
    },
  });

  const onSubmit = async (data: WineFormSchema) => {
    try {
      await updateWine(wine.id, data);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating wine:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Seleziona un file immagine");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("L'immagine deve essere inferiore a 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload directly to Supabase Storage from client (bypasses Next.js body size limits)
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
      const { error: uploadError, data } = await supabase.storage
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

      setPreviewUrl(publicUrl);
      onUpdate();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Errore durante l'upload dell'immagine"
      );
      setPreviewUrl(wine.label_image_url);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm("Eliminare l'immagine dell'etichetta?")) return;

    try {
      await deleteLabelImage(wine.id);
      setPreviewUrl(null);
      onUpdate();
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Errore durante l'eliminazione dell'immagine");
    }
  };

  if (!isEditing) {
    return (
      <GlassCard>
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Scheda Vino
          </h2>
          <GlassButton variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            Modifica
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-sm text-[var(--text-muted)]">Nome</span>
              <p className="text-[var(--text-primary)]">{wine.name}</p>
            </div>
            {wine.producer && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Produttore</span>
                <p className="text-[var(--text-primary)]">{wine.producer}</p>
              </div>
            )}
            {wine.vintage && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Annata</span>
                <p className="text-[var(--text-primary)]">{wine.vintage}</p>
              </div>
            )}
            {wine.wine_type && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Tipo</span>
                <p className="text-[var(--text-primary)]">{wine.wine_type}</p>
              </div>
            )}
            {wine.region && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Regione</span>
                <p className="text-[var(--text-primary)]">{wine.region}</p>
              </div>
            )}
            {wine.country && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Paese</span>
                <p className="text-[var(--text-primary)]">{wine.country}</p>
              </div>
            )}
            {wine.appellation && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Denominazione</span>
                <p className="text-[var(--text-primary)]">{wine.appellation}</p>
              </div>
            )}
            {wine.grapes && Array.isArray(wine.grapes) && wine.grapes.length > 0 && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Uvaggi</span>
                <p className="text-[var(--text-primary)]">
                  {wine.grapes
                    .map((g: Grape | string) => {
                      if (typeof g === "string") return g;
                      return g.percent ? `${g.name} ${g.percent}%` : g.name;
                    })
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-sm text-[var(--text-muted)]">Quantità</span>
              <p className="text-[var(--text-primary)]">{wine.quantity}</p>
            </div>
            {wine.price && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Prezzo</span>
                <p className="text-[var(--text-primary)]">
                  {wine.price.toFixed(2)} {wine.currency || "EUR"}
                </p>
              </div>
            )}
            {wine.location && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Posizione</span>
                <p className="text-[var(--text-primary)]">{wine.location}</p>
              </div>
            )}
            {wine.cellar_location && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Cantina</span>
                <p className="text-[var(--text-primary)]">{wine.cellar_location}</p>
              </div>
            )}
            {wine.readiness_status && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Stato</span>
                <p className="text-[var(--text-primary)]">{wine.readiness_status}</p>
              </div>
            )}
            {wine.drink_from && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Bere da</span>
                <p className="text-[var(--text-primary)]">{wine.drink_from}</p>
              </div>
            )}
            {wine.drink_until && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Bere entro</span>
                <p className="text-[var(--text-primary)]">{wine.drink_until}</p>
              </div>
            )}
            {wine.story && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Storia</span>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                  {wine.story}
                </p>
              </div>
            )}
            {wine.notes && (
              <div>
                <span className="text-sm text-[var(--text-muted)]">Note</span>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap">
                  {wine.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Label Image */}
        <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Immagine Etichetta
          </h3>
          {previewUrl ? (
            <div className="relative inline-block">
              <div className="relative w-64 h-64 rounded-lg overflow-hidden border border-[var(--border-default)]">
                <Image
                  src={previewUrl}
                  alt={`Etichetta ${wine.name}`}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Caricamento..." : "Sostituisci"}
                </GlassButton>
                <GlassButton
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteImage}
                >
                  Elimina
                </GlassButton>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Caricamento..." : "Carica Immagine"}
              </GlassButton>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Modifica Scheda Vino
          </h2>
          <div className="flex gap-2">
            <GlassButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
            >
              Annulla
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : "Salva"}
            </GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput label="Nome *" {...register("name")} error={errors.name?.message} />
          <GlassInput
            label="Produttore"
            {...register("producer")}
            error={errors.producer?.message}
          />
          <GlassInput
            label="Annata"
            type="number"
            {...register("vintage", { valueAsNumber: true })}
            error={errors.vintage?.message}
          />
          <GlassInput
            label="Quantità *"
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            error={errors.quantity?.message}
          />
          <GlassInput
            label="Regione"
            {...register("region")}
            error={errors.region?.message}
          />
          <GlassInput
            label="Paese"
            {...register("country")}
            error={errors.country?.message}
          />
          <GlassInput
            label="Prezzo"
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            error={errors.price?.message}
          />
          <GlassInput
            label="Posizione"
            {...register("location")}
            error={errors.location?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Uvaggi
          </label>
          <Controller
            name="grapes"
            control={control}
            render={({ field }) => (
              <GrapesMultiSelect
                grapes={field.value || []}
                onChange={field.onChange}
                error={errors.grapes?.message || (errors.grapes?.root?.message as string)}
              />
            )}
          />
        </div>

        <GlassTextarea
          label="Storia"
          {...register("story")}
          error={errors.story?.message}
          rows={6}
        />

        <GlassTextarea
          label="Note"
          {...register("notes")}
          error={errors.notes?.message}
          rows={4}
        />
      </form>
    </GlassCard>
  );
}

