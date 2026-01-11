import { z } from "zod";

// Grape schema
const grapeSchema = z.object({
  name: z.string().min(1, "Nome uvaggio obbligatorio"),
  percent: z.number().min(0).max(100).optional(),
});

export const wineFormSchema = z
  .object({
    // Campi obbligatori
    name: z.string().min(1, "Il nome è obbligatorio"),
    producer: z.string().min(1, "Il produttore è obbligatorio"),
    wine_type: z.enum(["red", "white", "rosé", "orange", "sparkling", "champagne", "liquor"]),
    country: z.enum(["italia", "francia", "germania", "austria", "usa", "argentina", "resto-del-mondo"]),
    quantity: z.number().int().min(0, "La quantità deve essere >= 0"),

    // Campi opzionali con validazioni
    vintage: z
      .number()
      .int()
      .min(1900, "Annata non valida (min 1900)")
      .max(new Date().getFullYear() + 1, "Annata non valida (max anno corrente + 1)")
      .optional()
      .nullable(),
    region: z.string().optional().nullable(),
    grapes: z.array(grapeSchema).default([]),
    abv: z.number().min(0, "Grado alcolico non valido").max(20, "Grado alcolico non valido (max 20%)").optional().nullable(),
    price: z.number().min(0, "Il prezzo deve essere >= 0").optional().nullable(),
    currency: z.string().default("EUR").optional(),
    location: z.string().optional().nullable(),
    label_image_path: z.string().optional().nullable(),
    label_image_url: z.string().url().optional().nullable(), // Per compatibilità
    story: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),

    // Campi legacy (mantenuti per compatibilità)
    cellar_location: z.string().optional().nullable(),
    readiness_status: z.enum(["ready", "aging", "peak", "past_peak"]).optional().nullable(),
    drink_from: z.number().int().min(1900).optional().nullable(),
    drink_until: z.number().int().min(1900).optional().nullable(),
    appellation: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // Validazione percentuali uvaggi: se almeno una percentuale è inserita, somma deve essere 100 (tolleranza 99-101)
      const grapes = data.grapes || [];
      const grapesWithPercent = grapes.filter((g) => g.percent !== undefined && g.percent !== null);
      if (grapesWithPercent.length === 0) return true; // Nessuna percentuale inserita, ok

      const total = grapesWithPercent.reduce((sum, g) => sum + (g.percent || 0), 0);
      return total >= 99 && total <= 101; // Tolleranza 99-101
    },
    {
      message: "La somma delle percentuali degli uvaggi deve essere 100% (tolleranza 99-101%)",
      path: ["grapes"],
    }
  )
  .refine(
    (data) => {
      // Validazione regione basata su paese
      if (data.country === "germania" || data.country === "austria" || data.country === "argentina") {
        return data.region === null || data.region === "";
      }
      return true;
    },
    {
      message: "Questo paese non supporta la selezione di una regione",
      path: ["region"],
    }
  );

export type WineFormSchema = z.infer<typeof wineFormSchema>;
export type GrapeSchema = z.infer<typeof grapeSchema>;

