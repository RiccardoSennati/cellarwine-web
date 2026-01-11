import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWineWithDetails } from "@/features/wine/actions";

// PDFKit requires Node.js runtime
// fs.readFileSync must be patched BEFORE importing utils.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Import utils AFTER runtime is set
// This ensures the patch in utils.ts is applied before PDFKit loads
import {
  PDFDocument,
  generateQRCode,
} from "@/lib/pdf/utils";
import { getLabelImageData } from "@/lib/pdf/wine-helpers";
import { drawWineSheet } from "@/lib/pdf/wine-layout";

export async function GET(
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

    // Fetch wine with auth guard
    const wine = await getWineWithDetails(id);

    if (!wine || wine.user_id !== user.id) {
      return NextResponse.json({ error: "Wine not found" }, { status: 404 });
    }

    // Generate QR code
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const wineUrl = `${baseUrl}/app/wine/${id}`;
    let qrBuffer: Buffer;
    try {
      qrBuffer = await generateQRCode(wineUrl);
    } catch (qrError) {
      console.error("Error generating QR code:", qrError);
      // Continue without QR code if generation fails
      qrBuffer = Buffer.alloc(0);
    }

    // Create PDF using Times fonts (more reliable in Next.js than Helvetica)
    // Times-Roman, Times-Bold work without font path issues
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Collect PDF chunks
    const chunks: Buffer[] = [];

    // Wait for PDF to be generated and return buffer
    const pdfPromise = new Promise<NextResponse>((resolve, reject) => {
      doc.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        try {
          if (chunks.length === 0) {
            reject(new Error("PDF generation produced no data"));
            return;
          }
          const pdfBuffer = Buffer.concat(chunks);
          resolve(
            new NextResponse(pdfBuffer, {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="wine-${wine.name.replace(/[^a-z0-9]/gi, "-")}-${id}.pdf"`,
              },
            })
          );
        } catch (error) {
          reject(error);
        }
      });

      doc.on("error", (error: Error) => {
        reject(error);
      });
    });

    // Generate PDF content with error handling
    try {
      // Get label image data (base64 or null)
      const labelImageData = await getLabelImageData(wine);

      // Draw professional wine sheet layout
      await drawWineSheet(doc, wine, labelImageData, qrBuffer);

      // Finalize PDF
      doc.end();
    } catch (pdfError) {
      console.error("Error generating PDF content:", pdfError);
      doc.destroy();
      return NextResponse.json(
        { error: `PDF generation error: ${pdfError instanceof Error ? pdfError.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    // Return promise that resolves when PDF is complete
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<NextResponse>((_, reject) => {
      setTimeout(() => {
        reject(new Error("PDF generation timeout after 30 seconds"));
      }, 30000);
    });

    try {
      return await Promise.race([pdfPromise, timeoutPromise]);
    } catch (error) {
      console.error("Error in PDF promise:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unknown error in PDF generation" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating wine PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
