"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { GlassCard, GlassButton } from "@/components/glass";
import { ProgressIndicator } from "./ProgressIndicator";
import { TastingWizardSteps } from "./TastingWizardSteps";
import { getTastingSchema, type BaseTastingForm, type ProTastingForm } from "./schema";
import { createTasting, updateTasting } from "./actions";
import type { BaseTastingForm as BaseForm, ProTastingForm as ProForm } from "./schema";

interface TastingWizardProps {
  wineId: string;
  tastingId?: string; // If provided, we're editing an existing tasting
  initialData?: BaseTastingForm | ProTastingForm;
}

const steps = [
  { label: "Contesto" },
  { label: "Vista" },
  { label: "Naso" },
  { label: "Bocca" },
  { label: "Finale" },
  { label: "Review" },
];

export function TastingWizard({ wineId, tastingId, initialData }: TastingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!tastingId;

  const defaultValues: BaseForm | ProForm = initialData || {
    tasting_date: new Date(),
    aromatic_families: [],
    textures: [],
    faults: [],
    food_pairing: [],
    is_draft: false,
  };

  const schema = getTastingSchema(isPro);
  const form = useForm<BaseForm | ProForm>({
    resolver: zodResolver(schema) as any,
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      // Detect if initial data has pro fields
      const hasProFields =
        "appearance_notes" in initialData ||
        "aroma_notes" in initialData ||
        ("textures" in initialData && Array.isArray(initialData.textures) && initialData.textures.length > 0);
      setIsPro(hasProFields);
    }
  }, [initialData, form]);

  const handleNext = () => {
    form.trigger().then((isValid) => {
      if (isValid && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    });
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const data = form.getValues();
      if (isEditing && tastingId) {
        await updateTasting(tastingId, { ...data, is_draft: true });
      } else {
        await createTasting(wineId, { ...data, is_draft: true });
      }
      router.push(`/app/wine/${wineId}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Errore nel salvataggio della bozza");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: BaseForm | ProForm) => {
    setIsSubmitting(true);
    try {
      if (isEditing && tastingId) {
        await updateTasting(tastingId, { ...data, is_draft: false });
      } else {
        await createTasting(wineId, { ...data, is_draft: false });
      }
      router.push(`/app/wine/${wineId}`);
      router.refresh();
    } catch (error) {
      console.error("Error saving tasting:", error);
      alert(isEditing ? "Errore nell'aggiornamento della degustazione" : "Errore nel salvataggio della degustazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeToggle = (newIsPro: boolean) => {
    setIsPro(newIsPro);
    // Ensure pro fields are initialized if switching to pro
    if (newIsPro) {
      const currentValues = form.getValues() as any;
      if (!("textures" in currentValues)) {
        form.setValue("textures" as any, []);
      }
      if (!("faults" in currentValues)) {
        form.setValue("faults" as any, []);
      }
      if (!("food_pairing" in currentValues)) {
        form.setValue("food_pairing" as any, []);
      }
    }
    form.clearErrors();
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Modalità
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {isPro
                ? "Modalità Pro: tutti i campi disponibili"
                : "Modalità Base: campi essenziali"}
            </p>
          </div>
          <div className="flex gap-2">
            <GlassButton
              variant={!isPro ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleModeToggle(false)}
            >
              Base
            </GlassButton>
            <GlassButton
              variant={isPro ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleModeToggle(true)}
            >
              Pro
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Progress */}
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={steps.length}
        steps={steps}
      />

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <TastingWizardSteps
          form={form}
          currentStep={currentStep}
          isPro={isPro}
          onNext={handleNext}
          onPrev={handlePrev}
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
}

