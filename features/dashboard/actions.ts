"use server";

import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
    bottles: {
        total: number;
        ready: number;
        aging: number;
    };
    labels: {
        total: number;
        recent: number; // Last 30 days
    };
    tastings: {
        total: number;
        thisMonth: number;
        averageRating: number;
    };
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated");
    }

    // Get all wines for the user
    const { data: wines, error: winesError } = await supabase
        .from("wines")
        .select("id, quantity, readiness_status, created_at, label_image_path")
        .eq("user_id", user.id);

    if (winesError) {
        throw new Error(`Error fetching wines: ${winesError.message}`);
    }

    // Calculate bottle statistics
    const totalBottles = wines?.reduce((sum, wine) => sum + (wine.quantity || 0), 0) || 0;
    const readyBottles =
        wines?.reduce((sum, wine) => {
            if (wine.readiness_status === "ready" || wine.readiness_status === "peak") {
                return sum + (wine.quantity || 0);
            }
            return sum;
        }, 0) || 0;
    const agingBottles = totalBottles - readyBottles;

    // Calculate labels statistics
    const totalLabels = wines?.filter((wine) => wine.label_image_path).length || 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLabels =
        wines?.filter((wine) => {
            if (!wine.created_at) return false;
            const createdAt = new Date(wine.created_at);
            return (
                createdAt >= thirtyDaysAgo &&
                wine.label_image_path
            );
        }).length || 0;

    // Get all tastings for the user
    const { data: tastings, error: tastingsError } = await supabase
        .from("tastings")
        .select("id, rating, tasting_date, is_draft")
        .eq("user_id", user.id)
        .eq("is_draft", false); // Only count final tastings

    if (tastingsError) {
        throw new Error(`Error fetching tastings: ${tastingsError.message}`);
    }

    // Calculate tasting statistics
    const totalTastings = tastings?.length || 0;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTastings =
        tastings?.filter((tasting) => {
            if (!tasting.tasting_date) return false;
            const tastingDate = new Date(tasting.tasting_date);
            return tastingDate >= firstDayOfMonth;
        }).length || 0;

    // Calculate average rating (convert 0-100 to 0-5 scale for display)
    const ratingsWithValue = tastings?.filter((t) => t.rating != null) || [];
    const averageRating =
        ratingsWithValue.length > 0
            ? ratingsWithValue.reduce((sum, t) => sum + (t.rating || 0), 0) / ratingsWithValue.length / 20 // Convert 0-100 to 0-5
            : 0;

    return {
        bottles: {
            total: totalBottles,
            ready: readyBottles,
            aging: agingBottles,
        },
        labels: {
            total: totalLabels,
            recent: recentLabels,
        },
        tastings: {
            total: totalTastings,
            thisMonth: thisMonthTastings,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        },
    };
}

