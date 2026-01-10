import { z } from "zod";
import type { Wine, Tasting, Movement } from "@/types/db";

// Schema per validazione backup JSON
export const backupSchema = z.object({
  wines: z.array(z.any()).default([]),
  tastings: z.array(z.any()).default([]),
  movements: z.array(z.any()).default([]),
  version: z.string().optional(),
  exported_at: z.string().optional(),
});

export type BackupData = z.infer<typeof backupSchema>;

export interface ImportReport {
  wines: { created: number; updated: number; errors: number };
  tastings: { created: number; updated: number; errors: number };
  movements: { created: number; updated: number; errors: number };
  total: { created: number; updated: number; errors: number };
}

