import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTastingById } from "@/features/tasting/actions";
import { getWineWithDetails } from "@/features/wine/actions";
import {
  PDFDocument,
  generateQRCode,
  addHeader,
  addSection,
  addField,
  addQRCode,
  formatDate,
} from "@/lib/pdf/utils";

// PDFKit requires Node.js runtime
// fs.readFileSync is patched in utils.ts before PDFKit is loaded
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // Fetch tasting with auth guard
    const tasting = await getTastingById(id);

    if (!tasting || tasting.user_id !== user.id) {
      return NextResponse.json({ error: "Tasting not found" }, { status: 404 });
    }

    // Fetch wine for context
    const wine = await getWineWithDetails(tasting.wine_id);

    if (!wine || wine.user_id !== user.id) {
      return NextResponse.json({ error: "Wine not found" }, { status: 404 });
    }

    // Generate QR code (point to wine page with tastings tab)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const wineUrl = `${baseUrl}/app/wine/${tasting.wine_id}`;
    const qrBuffer = await generateQRCode(wineUrl);

    // Create PDF
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    // Set response headers
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    // Header
    addHeader(doc, `Degustazione: ${wine.name}`);

    let y = 120;

    // QR Code
    addQRCode(doc, qrBuffer, y - 20);

    // Contesto
    y = addSection(doc, "Contesto", y);
    y = addField(doc, "Data", formatDate(tasting.tasting_date), y);
    y = addField(doc, "Occasione", tasting.occasion, y);
    y = addField(doc, "Luogo", tasting.location, y);
    if (tasting.serving_temperature) {
      y = addField(doc, "Temperatura servizio", `${tasting.serving_temperature}°C`, y);
    }
    if (tasting.decanting_time) {
      y = addField(doc, "Tempo decantazione", `${tasting.decanting_time} minuti`, y);
    }

    y += 10;

    // Vista
    y = addSection(doc, "Vista", y);
    y = addField(doc, "Colore", tasting.color, y);
    y = addField(doc, "Intensità", tasting.intensity, y);
    if (tasting.appearance_notes) {
      doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor("#666666")
        .text(tasting.appearance_notes, 50, y, { width: 500 });
      y += doc.heightOfString(tasting.appearance_notes, { width: 500 }) + 20;
    }

    y += 10;

    // Naso
    y = addSection(doc, "Naso", y);
    y = addField(doc, "Intensità aromatica", tasting.aroma_intensity, y);
    if (tasting.aromatic_families && tasting.aromatic_families.length > 0) {
      y = addField(
        doc,
        "Famiglie aromatiche",
        tasting.aromatic_families.join(", "),
        y
      );
    }
    if (tasting.aroma_notes) {
      doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor("#666666")
        .text(tasting.aroma_notes, 50, y, { width: 500 });
      y += doc.heightOfString(tasting.aroma_notes, { width: 500 }) + 20;
    }

    y += 10;

    // Bocca
    y = addSection(doc, "Bocca", y);
    if (tasting.rating) {
      y = addField(doc, "Valutazione", `${tasting.rating}/100`, y);
    }
    y = addField(doc, "Dolcezza", tasting.sweetness, y);
    y = addField(doc, "Acidità", tasting.acidity, y);
    y = addField(doc, "Tannini", tasting.tannins, y);
    y = addField(doc, "Corpo", tasting.body, y);
    y = addField(doc, "Finale", tasting.finish, y);
    if (tasting.textures && tasting.textures.length > 0) {
      y = addField(doc, "Texture", tasting.textures.join(", "), y);
    }
    if (tasting.taste_notes) {
      doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor("#666666")
        .text(tasting.taste_notes, 50, y, { width: 500 });
      y += doc.heightOfString(tasting.taste_notes, { width: 500 }) + 20;
    }
    if (tasting.faults && tasting.faults.length > 0) {
      y = addField(doc, "Difetti", tasting.faults.join(", "), y);
    }

    y += 10;

    // Finale
    y = addSection(doc, "Considerazioni Finali", y);
    if (tasting.overall_notes) {
      doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor("#666666")
        .text(tasting.overall_notes, 50, y, { width: 500, align: "justify" });
      y += doc.heightOfString(tasting.overall_notes, { width: 500 }) + 20;
    }
    if (tasting.food_pairing && tasting.food_pairing.length > 0) {
      y = addField(doc, "Abbinamenti", tasting.food_pairing.join(", "), y);
    }

    // Footer
    const pageHeight = doc.page.height;
    doc
      .fontSize(8)
      .font("Times-Roman")
      .fillColor("#999999")
      .text(
        `Generato il ${new Date().toLocaleDateString("it-IT")} - CellarWine`,
        50,
        pageHeight - 50,
        { align: "center" }
      );

    // Finalize PDF
    doc.end();

    // Wait for PDF to be generated
    return new Promise<NextResponse>((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="tasting-${wine.name.replace(/[^a-z0-9]/gi, "-")}-${formatDate(tasting.tasting_date).replace(/[^a-z0-9]/gi, "-")}.pdf"`,
            },
          })
        );
      });
    });
  } catch (error) {
    console.error("Error generating tasting PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

