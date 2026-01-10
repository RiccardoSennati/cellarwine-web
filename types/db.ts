// Database types based on Supabase schema

export type WineType = "red" | "white" | "rosé" | "orange" | "sparkling" | "champagne" | "liquor";

export type Country = "italia" | "francia" | "germania" | "austria" | "usa" | "argentina" | "resto-del-mondo";

export type ReadinessStatus = "ready" | "aging" | "peak" | "past_peak";

export type MovementType = "in" | "out" | "transfer" | "consumed" | "gift" | "sold";

export interface Grape {
  name: string;
  percent?: number;
}

export interface Wine {
  id: string;
  user_id: string;
  name: string;
  producer: string;
  vintage: number | null;
  wine_type: WineType;
  country: Country;
  region: string | null;
  grapes: Grape[] | null; // JSONB array
  abv: number | null; // Grado alcolico
  quantity: number;
  price: number | null;
  currency: string | null;
  location: string | null; // Posizione fisica
  label_image_path: string | null; // Path su Storage
  label_image_url: string | null; // URL pubblico (per compatibilità)
  story: string | null; // Storia del vino
  notes: string | null; // Note personali
  // Campi legacy (mantenuti per compatibilità)
  cellar_location: string | null;
  readiness_status: ReadinessStatus | null;
  drink_from: number | null;
  drink_until: number | null;
  appellation: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tasting {
  id: string;
  user_id: string;
  wine_id: string;
  tasting_date: string;
  occasion: string | null;
  location: string | null;
  rating: number | null;
  overall_notes: string | null;
  color: string | null;
  intensity: string | null;
  appearance_notes: string | null;
  aromatic_families: string[] | null;
  aroma_notes: string | null;
  aroma_intensity: string | null;
  textures: string[] | null;
  sweetness: string | null;
  acidity: string | null;
  tannins: string | null;
  body: string | null;
  finish: string | null;
  taste_notes: string | null;
  faults: string[] | null;
  serving_temperature: string | null;
  decanting_time: number | null;
  food_pairing: string[] | null;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  user_id: string;
  wine_id: string;
  movement_type: MovementType;
  quantity: number;
  from_location: string | null;
  to_location: string | null;
  price: number | null;
  currency: string | null;
  source: string | null;
  destination: string | null;
  notes: string | null;
  movement_date: string;
  created_at: string;
  updated_at: string;
}

// Form types
export interface WineFormData {
  name: string;
  producer: string;
  vintage?: number | null;
  wine_type: WineType;
  country: Country;
  region?: string | null;
  grapes: Grape[];
  abv?: number | null;
  quantity: number;
  price?: number | null;
  currency?: string;
  location?: string | null;
  label_image_path?: string | null;
  story?: string | null;
  notes?: string | null;
  // Legacy fields (opzionali per compatibilità)
  label_image_url?: string | null;
  cellar_location?: string | null;
  readiness_status?: ReadinessStatus | null;
  drink_from?: number | null;
  drink_until?: number | null;
  appellation?: string | null;
}

// Filter and sort types
export interface WineFilters {
  search?: string;
  wine_type?: WineType;
  country?: Country | string;
  region?: string;
  vintage?: number;
}

export type WineSortField = "name" | "producer" | "vintage" | "quantity" | "created_at";
export type WineSortOrder = "asc" | "desc";

export interface WineSort {
  field: WineSortField;
  order: WineSortOrder;
}

