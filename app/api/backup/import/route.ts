import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { backupSchema, type ImportReport } from "@/features/backup/schema";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate schema
    const validationResult = backupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid backup format", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const backup = validationResult.data;
    const report: ImportReport = {
      wines: { created: 0, updated: 0, errors: 0 },
      tastings: { created: 0, updated: 0, errors: 0 },
      movements: { created: 0, updated: 0, errors: 0 },
      total: { created: 0, updated: 0, errors: 0 },
    };

    // Import wines (upsert by id)
    if (backup.wines && Array.isArray(backup.wines)) {
      for (const wine of backup.wines) {
        try {
          // Remove user_id from imported data and set current user
          const { user_id, ...wineData } = wine;
          const wineToImport = {
            ...wineData,
            user_id: user.id,
          };

          // Check if wine exists
          const { data: existing } = await supabase
            .from("wines")
            .select("id")
            .eq("id", wine.id)
            .eq("user_id", user.id)
            .single();

          if (existing) {
            // Update
            const { error } = await supabase
              .from("wines")
              .update(wineToImport)
              .eq("id", wine.id)
              .eq("user_id", user.id);
            if (error) throw error;
            report.wines.updated++;
          } else {
            // Insert
            const { error } = await supabase
              .from("wines")
              .insert(wineToImport);
            if (error) throw error;
            report.wines.created++;
          }
        } catch (error) {
          console.error("Error importing wine:", wine.id, error);
          report.wines.errors++;
        }
      }
    }

    // Import tastings (upsert by id)
    if (backup.tastings && Array.isArray(backup.tastings)) {
      for (const tasting of backup.tastings) {
        try {
          // Verify wine exists and belongs to user
          const { data: wine } = await supabase
            .from("wines")
            .select("id")
            .eq("id", tasting.wine_id)
            .eq("user_id", user.id)
            .single();

          if (!wine) {
            report.tastings.errors++;
            continue;
          }

          const { user_id, ...tastingData } = tasting;
          const tastingToImport = {
            ...tastingData,
            user_id: user.id,
          };

          // Check if tasting exists
          const { data: existing } = await supabase
            .from("tastings")
            .select("id")
            .eq("id", tasting.id)
            .eq("user_id", user.id)
            .single();

          if (existing) {
            // Update
            const { error } = await supabase
              .from("tastings")
              .update(tastingToImport)
              .eq("id", tasting.id)
              .eq("user_id", user.id);
            if (error) throw error;
            report.tastings.updated++;
          } else {
            // Insert
            const { error } = await supabase
              .from("tastings")
              .insert(tastingToImport);
            if (error) throw error;
            report.tastings.created++;
          }
        } catch (error) {
          console.error("Error importing tasting:", tasting.id, error);
          report.tastings.errors++;
        }
      }
    }

    // Import movements (upsert by id)
    if (backup.movements && Array.isArray(backup.movements)) {
      for (const movement of backup.movements) {
        try {
          // Verify wine exists and belongs to user
          const { data: wine } = await supabase
            .from("wines")
            .select("id")
            .eq("id", movement.wine_id)
            .eq("user_id", user.id)
            .single();

          if (!wine) {
            report.movements.errors++;
            continue;
          }

          const { user_id, ...movementData } = movement;
          const movementToImport = {
            ...movementData,
            user_id: user.id,
          };

          // Check if movement exists
          const { data: existing } = await supabase
            .from("movements")
            .select("id")
            .eq("id", movement.id)
            .eq("user_id", user.id)
            .single();

          if (existing) {
            // Update
            const { error } = await supabase
              .from("movements")
              .update(movementToImport)
              .eq("id", movement.id)
              .eq("user_id", user.id);
            if (error) throw error;
            report.movements.updated++;
          } else {
            // Insert
            const { error } = await supabase
              .from("movements")
              .insert(movementToImport);
            if (error) throw error;
            report.movements.created++;
          }
        } catch (error) {
          console.error("Error importing movement:", movement.id, error);
          report.movements.errors++;
        }
      }
    }

    // Calculate totals
    report.total.created =
      report.wines.created + report.tastings.created + report.movements.created;
    report.total.updated =
      report.wines.updated + report.tastings.updated + report.movements.updated;
    report.total.errors =
      report.wines.errors + report.tastings.errors + report.movements.errors;

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Error importing backup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

