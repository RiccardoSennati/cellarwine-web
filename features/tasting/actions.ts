"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tasting } from "@/types/db";
import type { BaseTastingForm, ProTastingForm } from "./schema";

export async function createTasting(
  wineId: string,
  formData: BaseTastingForm | ProTastingForm
): Promise<Tasting> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify wine ownership
  const { data: wine, error: wineError } = await supabase
    .from("wines")
    .select("id, user_id")
    .eq("id", wineId)
    .eq("user_id", user.id)
    .single();

  if (wineError || !wine) {
    throw new Error("Wine not found or access denied");
  }

  // Prepare data for insert, converting types to match database schema
  const insertData: any = {
    ...formData,
    wine_id: wineId,
    user_id: user.id,
    tasting_date: formData.tasting_date.toISOString().split("T")[0],
    // Convert serving_temperature from number to string (DB expects TEXT)
    serving_temperature: formData.serving_temperature != null
      ? String(formData.serving_temperature)
      : null,
    // Ensure is_draft is a boolean
    is_draft: formData.is_draft ?? false,
  };

  const { data, error } = await supabase
    .from("tastings")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating tasting: ${error.message}`);
  }

  revalidatePath(`/app/wine/${wineId}`);
  revalidatePath(`/app/tastings`);
  return data as Tasting;
}

export async function updateTasting(
  tastingId: string,
  formData: BaseTastingForm | ProTastingForm
): Promise<Tasting> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify tasting ownership
  const { data: existingTasting, error: existingError } = await supabase
    .from("tastings")
    .select("id, user_id, wine_id")
    .eq("id", tastingId)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existingTasting) {
    throw new Error("Tasting not found or access denied");
  }

  // Prepare data for update
  const updateData: any = {
    ...formData,
    tasting_date: formData.tasting_date.toISOString().split("T")[0],
    serving_temperature: formData.serving_temperature != null
      ? String(formData.serving_temperature)
      : null,
    is_draft: formData.is_draft ?? false,
  };

  const { data, error } = await supabase
    .from("tastings")
    .update(updateData)
    .eq("id", tastingId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating tasting: ${error.message}`);
  }

  revalidatePath(`/app/wine/${data.wine_id}`);
  revalidatePath(`/app/tastings`);
  return data as Tasting;
}

export async function getTastingById(tastingId: string): Promise<Tasting | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("tastings")
    .select("*")
    .eq("id", tastingId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Tasting;
}

export async function duplicateTasting(
  tastingId: string
): Promise<BaseTastingForm | ProTastingForm> {
  const tasting = await getTastingById(tastingId);
  if (!tasting) {
    throw new Error("Tasting not found");
  }

  const formData: any = {
    tasting_date: new Date(tasting.tasting_date),
    occasion: tasting.occasion || undefined,
    location: tasting.location || undefined,
    serving_temperature: tasting.serving_temperature ? parseFloat(tasting.serving_temperature) : undefined,
    decanting_time: tasting.decanting_time || undefined,
    color: tasting.color || undefined,
    intensity: tasting.intensity || undefined,
    aroma_intensity: tasting.aroma_intensity || undefined,
    aromatic_families: tasting.aromatic_families || [],
    rating: tasting.rating || undefined,
    overall_notes: tasting.overall_notes || undefined,
    appearance_notes: tasting.appearance_notes || undefined,
    aroma_notes: tasting.aroma_notes || undefined,
    textures: tasting.textures || [],
    sweetness: tasting.sweetness || undefined,
    acidity: tasting.acidity || undefined,
    tannins: tasting.tannins || undefined,
    body: tasting.body || undefined,
    finish: tasting.finish || undefined,
    taste_notes: tasting.taste_notes || undefined,
    faults: tasting.faults || [],
    food_pairing: tasting.food_pairing || [],
    is_draft: true, // Always duplicate as draft
  };

  return formData;
}

/**
 * Get all tastings for the current user (for Tastings page)
 */
export async function getAllTastings(): Promise<Array<Tasting & { wine_name: string; wine_producer: string | null }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // First get all tastings
  const { data: tastings, error: tastingsError } = await supabase
    .from("tastings")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_draft", false) // Only show final tastings
    .order("tasting_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (tastingsError) {
    throw new Error(`Error fetching tastings: ${tastingsError.message}`);
  }

  if (!tastings || tastings.length === 0) {
    return [];
  }

  // Get unique wine IDs
  const wineIds = [...new Set(tastings.map((t) => t.wine_id))];

  // Fetch wines in batch
  const { data: wines, error: winesError } = await supabase
    .from("wines")
    .select("id, name, producer")
    .eq("user_id", user.id)
    .in("id", wineIds);

  if (winesError) {
    throw new Error(`Error fetching wines: ${winesError.message}`);
  }

  // Create a map for quick lookup
  const wineMap = new Map(wines?.map((w) => [w.id, w]) || []);

  // Transform data to include wine info
  return tastings.map((tasting) => {
    const wine = wineMap.get(tasting.wine_id);
    return {
      ...tasting,
      wine_name: wine?.name || "Unknown",
      wine_producer: wine?.producer || null,
    };
  }) as Array<Tasting & { wine_name: string; wine_producer: string | null }>;
}

/**
 * Delete a tasting
 */
export async function deleteTasting(tastingId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify tasting ownership and get wine_id for revalidation
  const { data: existingTasting, error: existingError } = await supabase
    .from("tastings")
    .select("id, user_id, wine_id")
    .eq("id", tastingId)
    .eq("user_id", user.id)
    .single();

  if (existingError || !existingTasting) {
    throw new Error("Tasting not found or access denied");
  }

  const { error } = await supabase
    .from("tastings")
    .delete()
    .eq("id", tastingId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Error deleting tasting: ${error.message}`);
  }

  revalidatePath(`/app/wine/${existingTasting.wine_id}`);
  revalidatePath(`/app/tastings`);
}
