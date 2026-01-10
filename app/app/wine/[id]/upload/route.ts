import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Increase body size limit for Route Handler
// For Next.js 14+, Route Handlers have a default 1MB limit for body size
// We configure runtime and maxDuration to allow larger uploads
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout

// For file uploads in Route Handlers, Next.js uses a streaming parser
// The actual limit is controlled by the server, but we can handle larger files
// by ensuring proper configuration

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify wine ownership
    const { data: wine, error: wineError } = await supabase
      .from("wines")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (wineError || !wine) {
      return NextResponse.json({ error: "Wine not found" }, { status: 404 });
    }

    // Read FormData - Next.js 14+ supports streaming for large files
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error: any) {
      if (error.message?.includes("Body exceeded")) {
        return NextResponse.json(
          { error: "File troppo grande. Il limite massimo è 10MB." },
          { status: 413 }
        );
      }
      throw error;
    }

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename with user_id prefix for RLS policies
    // Path format: {user_id}/{wine_id}/{timestamp}.{ext}
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${id}/${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (bucket: labels)
    const { error: uploadError } = await supabase.storage
      .from("labels")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("labels").getPublicUrl(filePath);

    // Update wine with image path and URL
    const { error: updateError } = await supabase
      .from("wines")
      .update({
        label_image_path: filePath,
        label_image_url: publicUrl, // Keep for backward compatibility
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    revalidatePath(`/app/wine/${id}`);
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

