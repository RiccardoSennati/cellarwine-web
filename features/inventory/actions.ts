"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WineFormSchema } from "./schema";

export async function getWines(filters?: {
  search?: string;
  wine_type?: string;
  country?: string;
  region?: string;
  vintage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const supabase = await createClient();
  let query = supabase.from("wines").select("*");

  // Apply filters
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(
      `name.ilike.${searchTerm},producer.ilike.${searchTerm},region.ilike.${searchTerm},country.ilike.${searchTerm}`
    );
  }

  if (filters?.wine_type) {
    query = query.eq("wine_type", filters.wine_type);
  }

  if (filters?.country) {
    query = query.eq("country", filters.country);
  }

  if (filters?.region) {
    query = query.eq("region", filters.region);
  }

  if (filters?.vintage) {
    query = query.eq("vintage", filters.vintage);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || "created_at";
  const sortOrder = filters?.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching wines: ${error.message}`);
  }

  return data;
}

export async function getWineById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error fetching wine: ${error.message}`);
  }

  return data;
}

export async function createWine(formData: WineFormSchema) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Prepare data for insertion, handling grapes as JSONB
  const insertData: any = {
    user_id: user.id,
    name: formData.name,
    producer: formData.producer,
    wine_type: formData.wine_type,
    country: formData.country,
    vintage: formData.vintage ?? null,
    region: formData.region ?? null,
    grapes: formData.grapes && formData.grapes.length > 0 ? formData.grapes : null,
    abv: formData.abv ?? null,
    quantity: formData.quantity || 0,
    price: formData.price ?? null,
    currency: formData.currency || "EUR",
    location: formData.location ?? null,
    label_image_path: formData.label_image_path ?? null,
    label_image_url: formData.label_image_url ?? null, // For compatibility
    story: formData.story ?? null,
    notes: formData.notes ?? null,
    // Legacy fields (maintained for compatibility)
    cellar_location: formData.cellar_location ?? null,
    readiness_status: formData.readiness_status ?? null,
    drink_from: formData.drink_from ?? null,
    drink_until: formData.drink_until ?? null,
    appellation: formData.appellation ?? null,
  };

  const { data, error } = await supabase
    .from("wines")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating wine: ${error.message}`);
  }

  revalidatePath("/app/inventory");
  revalidatePath("/app");
  return data;
}

export async function updateWine(id: string, formData: WineFormSchema) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Prepare data for update, handling grapes as JSONB
  const updateData: any = {
    name: formData.name,
    producer: formData.producer,
    wine_type: formData.wine_type,
    country: formData.country,
    vintage: formData.vintage ?? null,
    region: formData.region ?? null,
    grapes: formData.grapes && formData.grapes.length > 0 ? formData.grapes : null,
    abv: formData.abv ?? null,
    quantity: formData.quantity || 0,
    price: formData.price ?? null,
    currency: formData.currency || "EUR",
    location: formData.location ?? null,
    label_image_path: formData.label_image_path ?? null,
    label_image_url: formData.label_image_url ?? null, // For compatibility
    story: formData.story ?? null,
    notes: formData.notes ?? null,
    // Legacy fields (maintained for compatibility)
    cellar_location: formData.cellar_location ?? null,
    readiness_status: formData.readiness_status ?? null,
    drink_from: formData.drink_from ?? null,
    drink_until: formData.drink_until ?? null,
    appellation: formData.appellation ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("wines")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating wine: ${error.message}`);
  }

  revalidatePath("/app/inventory");
  revalidatePath(`/app/wine/${id}`);
  revalidatePath("/app");
  return data;
}

export async function deleteWine(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("wines")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Error deleting wine: ${error.message}`);
  }

  revalidatePath("/app/inventory");
}

export async function drinkWine(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get current wine
  const { data: wine, error: wineError } = await supabase
    .from("wines")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (wineError || !wine) {
    throw new Error("Wine not found");
  }

  if (wine.quantity <= 0) {
    throw new Error("Cannot drink wine with zero quantity");
  }

  // Update wine quantity
  const { error: updateError } = await supabase
    .from("wines")
    .update({ quantity: wine.quantity - 1 })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(`Error updating wine quantity: ${updateError.message}`);
  }

  // Create movement
  const { error: movementError } = await supabase.from("movements").insert({
    user_id: user.id,
    wine_id: id,
    movement_type: "consumed",
    quantity: 1,
    from_location: wine.location,
    movement_date: new Date().toISOString().split("T")[0],
  });

  if (movementError) {
    // Rollback wine quantity update if movement creation fails
    await supabase
      .from("wines")
      .update({ quantity: wine.quantity })
      .eq("id", id);
    throw new Error(`Error creating movement: ${movementError.message}`);
  }

  revalidatePath("/app/inventory");
}

export async function getUniqueRegions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wines")
    .select("region")
    .not("region", "is", null);

  if (error) {
    return [];
  }

  const uniqueRegions = Array.from(
    new Set(data.map((w) => w.region).filter(Boolean))
  ) as string[];
  return uniqueRegions.sort();
}

export async function getUniqueVintages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wines")
    .select("vintage")
    .not("vintage", "is", null);

  if (error) {
    return [];
  }

  const uniqueVintages = Array.from(
    new Set(data.map((w) => w.vintage).filter(Boolean))
  ) as number[];
  return uniqueVintages.sort((a, b) => b - a); // Most recent first
}

export async function getUniqueCountries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wines")
    .select("country")
    .not("country", "is", null);

  if (error) {
    return [];
  }

  const uniqueCountries = Array.from(
    new Set(data.map((w) => w.country).filter(Boolean))
  ) as string[];
  return uniqueCountries.sort();
}

