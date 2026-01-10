import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data
    const [winesResult, tastingsResult, movementsResult] = await Promise.all([
      supabase.from("wines").select("*").eq("user_id", user.id),
      supabase.from("tastings").select("*").eq("user_id", user.id),
      supabase.from("movements").select("*").eq("user_id", user.id),
    ]);

    if (winesResult.error) {
      throw new Error(`Error fetching wines: ${winesResult.error.message}`);
    }
    if (tastingsResult.error) {
      throw new Error(`Error fetching tastings: ${tastingsResult.error.message}`);
    }
    if (movementsResult.error) {
      throw new Error(`Error fetching movements: ${movementsResult.error.message}`);
    }

    const backup = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      wines: winesResult.data || [],
      tastings: tastingsResult.data || [],
      movements: movementsResult.data || [],
    };

    return NextResponse.json(backup, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="cellarwine-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting backup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

