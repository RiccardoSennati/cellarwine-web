import { z } from "zod";

// Base schema (subset of fields)
const baseTastingSchema = z.object({
  // Step 1: Contesto + Servizio
  tasting_date: z.date().default(new Date()),
  occasion: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  serving_temperature: z.number().min(4).max(22).optional().nullable(),
  decanting_time: z.number().int().min(0).max(240).optional().nullable(),

  // Step 2: Vista (Base)
  color: z.string().max(50).optional().nullable(),
  intensity: z.enum(["pale", "medium", "deep"]).optional().nullable(),

  // Step 3: Naso (Base)
  aroma_intensity: z.enum(["light", "medium", "pronounced"]).optional().nullable(),
  aromatic_families: z.array(z.string()).default([]),

  // Step 4: Bocca (Base)
  rating: z.number().min(0).max(100).optional().nullable(),

  // Step 5: Finale (Base)
  overall_notes: z.string().max(2000).optional().nullable(),

  // Draft
  is_draft: z.boolean().default(false),
});

// Pro schema (all fields)
const proTastingSchema = baseTastingSchema.extend({
  // Step 2: Vista (Pro)
  appearance_notes: z.string().max(500).optional().nullable(),

  // Step 3: Naso (Pro)
  aroma_notes: z.string().max(1000).optional().nullable(),

  // Step 4: Bocca (Pro)
  textures: z.array(z.string()).default([]),
  sweetness: z.enum(["dry", "off-dry", "sweet"]).optional().nullable(),
  acidity: z.enum(["low", "medium", "high"]).optional().nullable(),
  tannins: z.enum(["low", "medium", "high", "firm"]).optional().nullable(),
  body: z.enum(["light", "medium", "full"]).optional().nullable(),
  finish: z.enum(["short", "medium", "long"]).optional().nullable(),
  taste_notes: z.string().max(1000).optional().nullable(),
  faults: z.array(z.string()).default([]),

  // Step 5: Finale (Pro)
  food_pairing: z.array(z.string()).default([]),
});

export type BaseTastingForm = z.infer<typeof baseTastingSchema>;
export type ProTastingForm = z.infer<typeof proTastingSchema>;

// Export schema based on mode
export function getTastingSchema(isPro: boolean) {
  return isPro ? proTastingSchema : baseTastingSchema;
}

// Aromatic families options
export const aromaticFamilies = [
  "Frutti rossi",
  "Frutti neri",
  "Frutti bianchi",
  "Agrumi",
  "Fiori",
  "Erbe",
  "Spezie",
  "Legno",
  "Tostato",
  "Mineralità",
  "Terroso",
  "Animale",
];

// Texture options
export const textures = [
  "Smooth",
  "Creamy",
  "Crisp",
  "Velvety",
  "Tannic",
  "Astringent",
  "Oily",
  "Watery",
];

// Faults options
export const faults = [
  "Corked",
  "Oxidized",
  "Reduced",
  "Volatile",
  "Brett",
  "Maderized",
  "Heat damaged",
];

