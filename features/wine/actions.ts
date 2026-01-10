"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Wine, Tasting, Movement } from "@/types/db";

export async function getWineWithDetails(id: string): Promise<Wine | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("wines")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Wine;
}

export async function getWineTastings(wineId: string): Promise<Tasting[]> {
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
    .eq("wine_id", wineId)
    .eq("user_id", user.id)
    .order("tasting_date", { ascending: false });

  if (error) {
    return [];
  }

  return (data || []) as Tasting[];
}

export async function getWineMovements(wineId: string): Promise<Movement[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("movements")
    .select("*")
    .eq("wine_id", wineId)
    .eq("user_id", user.id)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data || []) as Movement[];
}


export async function deleteLabelImage(wineId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get wine to get image URL
  const wine = await getWineWithDetails(wineId);
  if (!wine || wine.user_id !== user.id) {
    throw new Error("Wine not found or access denied");
  }

  // Use label_image_path if available, otherwise extract from URL
  let filePath: string | null = null;

  if (wine.label_image_path) {
    filePath = wine.label_image_path;
  } else if (wine.label_image_url) {
    // Extract file path from URL (backward compatibility)
    const urlParts = wine.label_image_url.split("/labels/");
    if (urlParts.length >= 2) {
      filePath = urlParts[1].split("?")[0];
    }
  }

  if (!filePath) {
    return; // No image to delete
  }

  // Delete from storage (bucket: labels)
  const { error: deleteError } = await supabase.storage
    .from("labels")
    .remove([filePath]);

  if (deleteError) {
    console.error("Error deleting image:", deleteError);
  }

  // Update wine - clear both path and URL
  const { error: updateError } = await supabase
    .from("wines")
    .update({
      label_image_path: null,
      label_image_url: null,
    })
    .eq("id", wineId)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(`Error updating wine: ${updateError.message}`);
  }

  revalidatePath(`/app/wine/${wineId}`);
}

export async function updateWineLabel(
  wineId: string,
  filePath: string,
  publicUrl: string
): Promise<void> {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify wine ownership
  const wine = await getWineWithDetails(wineId);
  if (!wine || wine.user_id !== user.id) {
    throw new Error("Wine not found or access denied");
  }

  // Update wine with image path and URL
  const { error: updateError } = await supabase
    .from("wines")
    .update({
      label_image_path: filePath,
      label_image_url: publicUrl, // Keep for backward compatibility
    })
    .eq("id", wineId)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(`Update failed: ${updateError.message}`);
  }

  revalidatePath(`/app/wine/${wineId}`);
}

export async function uploadLabelImage(
  wineId: string,
  formData: FormData
): Promise<{ url: string; path: string }> {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Verify wine ownership
  const wine = await getWineWithDetails(wineId);
  if (!wine || wine.user_id !== user.id) {
    throw new Error("Wine not found or access denied");
  }

  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  // Generate unique filename with user_id prefix for RLS policies
  // Path format: {user_id}/{wine_id}/{timestamp}.{ext}
  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/${wineId}/${Date.now()}.${fileExt}`;

  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("labels")
    .upload(filePath, buffer, {
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

  // Update wine with image path and URL (for backward compatibility)
  const { error: updateError } = await supabase
    .from("wines")
    .update({
      label_image_path: filePath,
      label_image_url: publicUrl, // Keep for backward compatibility
    })
    .eq("id", wineId)
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(`Update failed: ${updateError.message}`);
  }

  revalidatePath(`/app/wine/${wineId}`);
  return { url: publicUrl, path: filePath };
}

