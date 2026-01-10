"use server";

import { createClient } from "@/lib/supabase/server";
import type { Wine, Tasting } from "@/types/db";

export interface WineStats {
  totalWines: number;
  totalBottles: number;
  winesByType: Record<string, number>;
  winesByCountry: Record<string, number>;
  averageRating: number;
  totalTastings: number;
  winesWithLabels: number;
  totalValue: number;
  averagePrice: number;
  winesByReadiness: {
    ready: number;
    aging: number;
    peak: number;
    past_peak: number;
  };
  tastingsByMonth: Array<{ month: string; count: number }>;
  topRatedWines: Array<{ wine_id: string; wine_name: string; average_rating: number; count: number }>;
}

export async function getWineStats(): Promise<WineStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Get all wines
  const { data: wines, error: winesError } = await supabase
    .from("wines")
    .select("id, name, quantity, wine_type, country, readiness_status, price, currency, label_image_path")
    .eq("user_id", user.id);

  if (winesError) {
    throw new Error(`Error fetching wines: ${winesError.message}`);
  }

  // Get all tastings with ratings
  const { data: tastings, error: tastingsError } = await supabase
    .from("tastings")
    .select("id, wine_id, rating, tasting_date, is_draft")
    .eq("user_id", user.id)
    .eq("is_draft", false);

  if (tastingsError) {
    throw new Error(`Error fetching tastings: ${tastingsError.message}`);
  }

  // Calculate basic statistics
  const totalWines = wines?.length || 0;
  const totalBottles = wines?.reduce((sum, wine) => sum + (wine.quantity || 0), 0) || 0;
  const winesWithLabels = wines?.filter((w) => w.label_image_path).length || 0;

  // Wines by type
  const winesByType: Record<string, number> = {};
  wines?.forEach((wine) => {
    const type = wine.wine_type || "unknown";
    winesByType[type] = (winesByType[type] || 0) + 1;
  });

  // Wines by country
  const winesByCountry: Record<string, number> = {};
  wines?.forEach((wine) => {
    const country = wine.country || "unknown";
    winesByCountry[country] = (winesByCountry[country] || 0) + 1;
  });

  // Wines by readiness
  const winesByReadiness = {
    ready: 0,
    aging: 0,
    peak: 0,
    past_peak: 0,
  };
  wines?.forEach((wine) => {
    const status = wine.readiness_status;
    if (status && status in winesByReadiness) {
      winesByReadiness[status as keyof typeof winesByReadiness]++;
    }
  });

  // Total value and average price
  let totalValue = 0;
  let winesWithPrice = 0;
  wines?.forEach((wine) => {
    if (wine.price && wine.quantity) {
      totalValue += wine.price * wine.quantity;
      winesWithPrice++;
    }
  });
  const averagePrice = winesWithPrice > 0 ? totalValue / wines?.reduce((sum, w) => sum + (w.quantity || 0), 0) || 1 : 0;

  // Average rating (convert 0-100 to 0-5)
  const ratingsWithValue = tastings?.filter((t) => t.rating != null) || [];
  const averageRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum, t) => sum + (t.rating || 0), 0) / ratingsWithValue.length / 20
      : 0;

  // Tastings by month (last 12 months)
  const tastingsByMonth: Array<{ month: string; count: number }> = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString("it-IT", { year: "numeric", month: "short" });
    const count =
      tastings?.filter((t) => {
        if (!t.tasting_date) return false;
        const tastingDate = new Date(t.tasting_date);
        return (
          tastingDate.getFullYear() === date.getFullYear() &&
          tastingDate.getMonth() === date.getMonth()
        );
      }).length || 0;
    tastingsByMonth.push({ month: monthKey, count });
  }

  // Top rated wines (with at least 2 tastings)
  const wineRatings: Record<string, { sum: number; count: number; name: string }> = {};
  tastings?.forEach((tasting) => {
    if (tasting.rating != null) {
      if (!wineRatings[tasting.wine_id]) {
        const wine = wines?.find((w) => w.id === tasting.wine_id);
        wineRatings[tasting.wine_id] = {
          sum: 0,
          count: 0,
          name: wine?.name || "Unknown",
        };
      }
      wineRatings[tasting.wine_id].sum += tasting.rating;
      wineRatings[tasting.wine_id].count += 1;
    }
  });

  const topRatedWines = Object.entries(wineRatings)
    .filter(([, data]) => data.count >= 2)
    .map(([wine_id, data]) => ({
      wine_id,
      wine_name: data.name,
      average_rating: data.sum / data.count / 20, // Convert to 0-5 scale
      count: data.count,
    }))
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 5);

  return {
    totalWines,
    totalBottles,
    winesByType,
    winesByCountry,
    averageRating: Math.round(averageRating * 10) / 10,
    totalTastings: tastings?.length || 0,
    winesWithLabels,
    totalValue: Math.round(totalValue * 100) / 100,
    averagePrice: Math.round(averagePrice * 100) / 100,
    winesByReadiness,
    tastingsByMonth,
    topRatedWines,
  };
}

