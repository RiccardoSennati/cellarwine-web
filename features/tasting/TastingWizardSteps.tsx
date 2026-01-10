"use client";

import { GlassCard, GlassInput, GlassTextarea, GlassButton } from "@/components/glass";
import { MultiSelectChips } from "./MultiSelectChips";
import { aromaticFamilies, textures, faults } from "./schema";
import type { BaseTastingForm, ProTastingForm } from "./schema";
import { UseFormReturn } from "react-hook-form";

interface TastingWizardStepsProps {
  form: UseFormReturn<BaseTastingForm | ProTastingForm>;
  currentStep: number;
  isPro: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

export function TastingWizardSteps({
  form,
  currentStep,
  isPro,
  onNext,
  onPrev,
  onSaveDraft,
  isSubmitting,
}: TastingWizardStepsProps) {
  const { register, watch, setValue, formState: { errors } } = form;

  // Step 1: Contesto + Servizio
  if (currentStep === 0) {
    return (
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          1. Contesto e Servizio
        </h2>
        <div className="space-y-4">
          <GlassInput
            label="Data degustazione"
            type="date"
            {...register("tasting_date", { valueAsDate: true })}
            error={errors.tasting_date?.message}
          />
          <GlassInput
            label="Occasione"
            placeholder="Cena, degustazione, casual..."
            maxLength={120}
            {...register("occasion")}
            error={errors.occasion?.message}
          />
          <GlassInput
            label="Luogo"
            placeholder="Dove hai degustato il vino"
            maxLength={120}
            {...register("location")}
            error={errors.location?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Temperatura servizio (°C)"
              type="number"
              min={4}
              max={22}
              step={0.5}
              {...register("serving_temperature", { valueAsNumber: true })}
              error={errors.serving_temperature?.message}
            />
            <GlassInput
              label="Tempo decantazione (minuti)"
              type="number"
              min={0}
              max={240}
              {...register("decanting_time", { valueAsNumber: true })}
              error={errors.decanting_time?.message}
            />
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <GlassButton variant="secondary" onClick={onSaveDraft} disabled={isSubmitting}>
            Salva bozza
          </GlassButton>
          <GlassButton variant="primary" onClick={onNext}>
            Avanti →
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  // Step 2: Vista
  if (currentStep === 1) {
    return (
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          2. Vista
        </h2>
        <div className="space-y-4">
          <GlassInput
            label="Colore"
            placeholder="Rubino, granato, dorato..."
            maxLength={50}
            {...register("color")}
            error={errors.color?.message}
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Intensità
            </label>
            <select
              {...register("intensity")}
              className="w-full rounded-lg px-4 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] backdrop-blur-[var(--glass-blur)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
            >
              <option value="">Seleziona...</option>
              <option value="pale">Pallido</option>
              <option value="medium">Medio</option>
              <option value="deep">Intenso</option>
            </select>
          </div>
          {isPro && (
            <GlassTextarea
              label="Note sull'aspetto"
              placeholder="Descrizione dettagliata dell'aspetto visivo..."
              maxLength={500}
              rows={4}
              {...register("appearance_notes")}
              error={(errors as any).appearance_notes?.message}
            />
          )}
        </div>
        <div className="flex justify-between mt-6">
          <GlassButton variant="secondary" onClick={onPrev}>
            ← Indietro
          </GlassButton>
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={onSaveDraft} disabled={isSubmitting}>
              Salva bozza
            </GlassButton>
            <GlassButton variant="primary" onClick={onNext}>
              Avanti →
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Step 3: Naso
  if (currentStep === 2) {
    const aromaticFamiliesValue = watch("aromatic_families") || [];
    return (
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          3. Naso
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Intensità aromatica
            </label>
            <select
              {...register("aroma_intensity")}
              className="w-full rounded-lg px-4 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] backdrop-blur-[var(--glass-blur)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
            >
              <option value="">Seleziona...</option>
              <option value="light">Leggera</option>
              <option value="medium">Media</option>
              <option value="pronounced">Pronunciata</option>
            </select>
          </div>
          <MultiSelectChips
            label="Famiglie aromatiche"
            options={aromaticFamilies}
            selected={aromaticFamiliesValue}
            onChange={(selected) => setValue("aromatic_families", selected)}
          />
          {isPro && (
            <GlassTextarea
              label="Note aromatiche"
              placeholder="Descrizione dettagliata dei profumi..."
              maxLength={1000}
              rows={4}
              {...register("aroma_notes")}
              error={(errors as any).aroma_notes?.message}
            />
          )}
        </div>
        <div className="flex justify-between mt-6">
          <GlassButton variant="secondary" onClick={onPrev}>
            ← Indietro
          </GlassButton>
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={onSaveDraft} disabled={isSubmitting}>
              Salva bozza
            </GlassButton>
            <GlassButton variant="primary" onClick={onNext}>
              Avanti →
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Step 4: Bocca
  if (currentStep === 3) {
    const texturesValue = watch("textures") || [];
    const faultsValue = watch("faults") || [];
    return (
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          4. Bocca
        </h2>
        <div className="space-y-4">
          <GlassInput
            label="Valutazione (0-100)"
            type="number"
            min={0}
            max={100}
            {...register("rating", { valueAsNumber: true })}
            error={errors.rating?.message}
          />
          {isPro && (
            <>
              <MultiSelectChips
                label="Texture"
                options={textures}
                selected={texturesValue}
                onChange={(selected) => setValue("textures", selected)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Dolcezza
                  </label>
                  <select
                    {...register("sweetness")}
                    className="w-full rounded-lg px-4 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] backdrop-blur-[var(--glass-blur)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                  >
                    <option value="">Seleziona...</option>
                    <option value="dry">Secco</option>
                    <option value="off-dry">Abboccato</option>
                    <option value="sweet">Dolce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Acidità
                  </label>
                  <select
                    {...register("acidity")}
                    className="w-full rounded-lg px-4 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] backdrop-blur-[var(--glass-blur)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                  >
                    <option value="">Seleziona...</option>
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Tannini
                  </label>
                  <select
                    {...register("tannins")}
                    className="w-full rounded-lg px-4 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] backdrop-blur-[var(--glass-blur)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                  >
                    <option value="">Seleziona...</option>
                    <option value="low">Bassi</option>
                    <option value="medium">Medi</option>
                    <option value="high">Alti</option>
                    <option value="firm">Fermi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Corpo
                  </label>
                  <select
                    {...register("body")}
                    className="w-full rounded-lg px-4 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] backdrop-blur-[var(--glass-blur)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                  >
                    <option value="">Seleziona...</option>
                    <option value="light">Leggero</option>
                    <option value="medium">Medio</option>
                    <option value="full">Pieno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Finale
                  </label>
                  <select
                    {...register("finish")}
                    className="w-full rounded-lg px-4 py-2 bg-[var(--surface-base)] border border-[var(--border-default)] backdrop-blur-[var(--glass-blur)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
                  >
                    <option value="">Seleziona...</option>
                    <option value="short">Corto</option>
                    <option value="medium">Medio</option>
                    <option value="long">Lungo</option>
                  </select>
                </div>
              </div>
              <GlassTextarea
                label="Note di gusto"
                placeholder="Descrizione dettagliata del sapore..."
                maxLength={1000}
                rows={4}
                {...register("taste_notes")}
                error={(errors as any).taste_notes?.message}
              />
              <MultiSelectChips
                label="Difetti"
                options={faults}
                selected={faultsValue}
                onChange={(selected) => setValue("faults", selected)}
              />
            </>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <GlassButton variant="secondary" onClick={onPrev}>
            ← Indietro
          </GlassButton>
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={onSaveDraft} disabled={isSubmitting}>
              Salva bozza
            </GlassButton>
            <GlassButton variant="primary" onClick={onNext}>
              Avanti →
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Step 5: Finale + Abbinamenti
  if (currentStep === 4) {
    const foodPairingValue = watch("food_pairing") || [];
    return (
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          5. Finale e Abbinamenti
        </h2>
        <div className="space-y-4">
          <GlassTextarea
            label="Note generali"
            placeholder="Considerazioni finali sulla degustazione..."
            maxLength={2000}
            rows={6}
            {...register("overall_notes")}
            error={errors.overall_notes?.message}
          />
          {isPro && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Abbinamenti cibo
              </label>
              <GlassInput
                placeholder="Inserisci abbinamenti separati da virgola"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const value = input.value.trim();
                    if (value && !foodPairingValue.includes(value)) {
                      setValue("food_pairing", [...foodPairingValue, value]);
                      input.value = "";
                    }
                  }
                }}
              />
              {foodPairingValue.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {foodPairingValue.map((pairing, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[var(--surface-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
                    >
                      {pairing}
                      <button
                        onClick={() =>
                          setValue(
                            "food_pairing",
                            foodPairingValue.filter((_, i) => i !== idx)
                          )
                        }
                        className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <GlassButton variant="secondary" onClick={onPrev}>
            ← Indietro
          </GlassButton>
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={onSaveDraft} disabled={isSubmitting}>
              Salva bozza
            </GlassButton>
            <GlassButton variant="primary" onClick={onNext}>
              Avanti →
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Step 6: Review
  if (currentStep === 5) {
    const formData = watch();
    return (
      <GlassCard variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          6. Riepilogo
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">
              Contesto
            </h3>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <p>
                <strong>Data:</strong>{" "}
                {formData.tasting_date
                  ? new Date(formData.tasting_date).toLocaleDateString("it-IT")
                  : "-"}
              </p>
              {formData.occasion && (
                <p>
                  <strong>Occasione:</strong> {formData.occasion}
                </p>
              )}
              {formData.location && (
                <p>
                  <strong>Luogo:</strong> {formData.location}
                </p>
              )}
            </div>
          </div>
          {formData.rating && (
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                Valutazione
              </h3>
              <p className="text-2xl font-bold text-[var(--accent-primary)]">
                {formData.rating}/100
              </p>
            </div>
          )}
          {formData.overall_notes && (
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                Note
              </h3>
              <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                {formData.overall_notes}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <GlassButton variant="secondary" onClick={onPrev}>
            ← Indietro
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={() => form.handleSubmit(() => {})()}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvataggio..." : "Salva degustazione"}
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  return null;
}

