import type { PDFDocument } from "pdfkit";
import type { Wine } from "@/types/db";
import { COLORS } from "./utils";
import { formatGrapes, normalizeText, truncateText } from "./wine-helpers";

/**
 * Draw a professional wine technical sheet PDF layout
 * Style: Producer technical sheet (like Cavazza, Antinori)
 */
export async function drawWineSheet(
    doc: InstanceType<typeof PDFDocument>,
    wine: Wine,
    labelImageData: Buffer | null,
    qrBuffer: Buffer
) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    // Layout constants - LEFT COLUMN (60-65%) for text, RIGHT COLUMN (35-40%) for label
    const leftColWidth = contentWidth * 0.62; // 62% left column
    const rightColWidth = contentWidth * 0.35; // 35% right column
    const gap = contentWidth * 0.03; // 3% gap
    const leftColX = margin;
    const rightColX = margin + leftColWidth + gap;

    let y = margin;

    // ============================================================================
    // HEADER (Full width)
    // ============================================================================
    y = drawHeader(doc, wine, qrBuffer, y, pageWidth, margin);

    // ============================================================================
    // BODY (2 columns)
    // ============================================================================
    const bodyStartY = y + 20;

    // LEFT COLUMN (60-65%) - Text sections
    y = bodyStartY;
    y = drawLeftColumn(doc, wine, leftColX, y, leftColWidth, pageHeight - margin - 50);

    // RIGHT COLUMN (35-40%) - Label and boxes
    y = bodyStartY;
    y = drawRightColumn(doc, wine, labelImageData, rightColX, y, rightColWidth, pageHeight - margin - 50);

    // ============================================================================
    // FOOTER
    // ============================================================================
    drawFooter(doc, pageHeight, pageWidth, margin);
}

/**
 * Draw header with title, subtitle, vintage badge, and optional QR code
 */
function drawHeader(
    doc: InstanceType<typeof PDFDocument>,
    wine: Wine,
    qrBuffer: Buffer,
    startY: number,
    pageWidth: number,
    margin: number
): number {
    let y = startY;

    // Main title (wine name) - large, bold, left-aligned
    doc
        .fontSize(32)
        .font("Times-Bold")
        .fillColor(COLORS.black)
        .text(wine.name || "Vino senza nome", margin, y, {
            width: pageWidth - margin * 2 - 120, // Leave space for QR code
            align: "left",
        });

    // Vintage badge next to title (if present)
    if (wine.vintage) {
        const badgeX = margin + doc.widthOfString(wine.name || "Vino senza nome", { font: "Times-Bold", fontSize: 32 }) + 15;
        const badgeY = y + 5;
        const badgeWidth = 55;
        const badgeHeight = 28;

        // Badge background
        doc
            .rect(badgeX, badgeY, badgeWidth, badgeHeight)
            .fillColor(COLORS.bordeaux)
            .fill();

        // Badge text
        doc
            .fontSize(14)
            .font("Times-Bold")
            .fillColor(COLORS.white)
            .text(String(wine.vintage), badgeX + badgeWidth / 2, badgeY + 7, {
                align: "center",
                width: badgeWidth,
            });
    }

    // QR Code (top right, optional)
    if (qrBuffer && qrBuffer.length > 0) {
        try {
            doc.image(qrBuffer, pageWidth - margin - 100, y, {
                width: 100,
                height: 100,
            });
        } catch (error) {
            console.error("Error adding QR code:", error);
        }
    }

    y += 40;

    // Subtitle: Producer · Denomination/Region · Country
    const subtitleParts: string[] = [];
    if (wine.producer) subtitleParts.push(wine.producer);
    if (wine.appellation) {
        subtitleParts.push(wine.appellation);
    } else if (wine.region) {
        subtitleParts.push(wine.region);
    }
    if (wine.country) subtitleParts.push(normalizeText(wine.country));

    if (subtitleParts.length > 0) {
        doc
            .fontSize(11)
            .font("Times-Roman")
            .fillColor(COLORS.gray)
            .text(subtitleParts.join(" · "), margin, y, {
                width: pageWidth - margin * 2,
                align: "left",
            });
        y += 25;
    }

    // Divider line (thin, bordeaux)
    doc
        .strokeColor(COLORS.bordeaux)
        .lineWidth(0.8)
        .moveTo(margin, y)
        .lineTo(pageWidth - margin, y)
        .stroke();

    return y + 20;
}

/**
 * Draw left column with text sections (60-65% width)
 */
function drawLeftColumn(
    doc: InstanceType<typeof PDFDocument>,
    wine: Wine,
    x: number,
    startY: number,
    width: number,
    maxY: number
): number {
    let y = startY;

    // 1) STORIA (if present)
    if (wine.story) {
        y = drawTextSection(
            doc,
            "STORIA",
            wine.story,
            x,
            y,
            width,
            8, // max 8 lines
            maxY
        );
        if (y >= maxY - 50) return y; // Check if we need new page
        y += 20;
    }

    // 2) DATI TECNICI (Technical data blocks)
    y = drawTechnicalData(doc, wine, x, y, width, maxY);
    if (y >= maxY - 50) return y;
    y += 15;

    // 3) NOTE DI DEGUSTAZIONE
    if (wine.notes) {
        y = drawTextSection(
            doc,
            "NOTE DI DEGUSTAZIONE",
            wine.notes,
            x,
            y,
            width,
            10, // max 10 lines
            maxY
        );
        if (y >= maxY - 50) return y;
        y += 20;
    }

    // 4) ABBINAMENTI GASTRONOMICI (if we have food pairing data)
    // Note: This would come from tastings, for now we skip or add placeholder

    return y;
}

/**
 * Draw technical data sections
 */
function drawTechnicalData(
    doc: InstanceType<typeof PDFDocument>,
    wine: Wine,
    x: number,
    y: number,
    width: number,
    maxY: number
): number {
    let currentY = y;

    // ORIGINE
    const originParts: string[] = [];
    if (wine.country) originParts.push(normalizeText(wine.country));
    if (wine.region) originParts.push(wine.region);
    if (originParts.length > 0) {
        currentY = drawKeyValueBlock(
            doc,
            "ORIGINE",
            originParts.join(", "),
            x,
            currentY,
            width
        );
        if (currentY >= maxY - 50) return currentY;
        currentY += 15;
    }

    // VITIGNI
    const grapesText = formatGrapes(wine.grapes as any);
    if (grapesText) {
        currentY = drawKeyValueBlock(
            doc,
            "VITIGNI",
            grapesText,
            x,
            currentY,
            width
        );
        if (currentY >= maxY - 50) return currentY;
        currentY += 15;
    }

    // TIPO
    if (wine.wine_type) {
        currentY = drawKeyValueBlock(
            doc,
            "TIPO",
            normalizeText(wine.wine_type),
            x,
            currentY,
            width
        );
        if (currentY >= maxY - 50) return currentY;
        currentY += 15;
    }

    // VINIFICAZIONE / AFFINAMENTO (from notes if contains keywords)
    // For now, skip as it's not in the wine model directly

    // NOTE DEL PRODUTTORE / NOTE PERSONALI (if story/notes contain producer info)
    // For now, skip

    return currentY;
}

/**
 * Draw a key-value block (label in uppercase small + value)
 */
function drawKeyValueBlock(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    value: string,
    x: number,
    y: number,
    width: number
): number {
    // Label (uppercase, small, bold)
    doc
        .fontSize(8)
        .font("Times-Bold")
        .fillColor(COLORS.black)
        .text(label.toUpperCase(), x, y);

    // Value (normal size, gray)
    doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor(COLORS.black)
        .text(value, x, y + 12, {
            width: width,
            align: "left",
        });

    // Thin divider line
    doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(x, y + 28)
        .lineTo(x + width, y + 28)
        .stroke();

    return y + 35;
}

/**
 * Draw a text section with title and content
 */
function drawTextSection(
    doc: InstanceType<typeof PDFDocument>,
    title: string,
    content: string,
    x: number,
    y: number,
    width: number,
    maxLines: number,
    maxY: number
): number {
    // Section title (small, uppercase, bordeaux)
    doc
        .fontSize(9)
        .font("Times-Bold")
        .fillColor(COLORS.bordeaux)
        .text(title.toUpperCase(), x, y);
    y += 15;

    // Truncate content
    const { text, height } = truncateText(content, maxLines, 12);

    // Content (elegant, justified)
    doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor(COLORS.black)
        .text(text, x, y, {
            width: width,
            align: "justify",
            lineGap: 3,
        });

    return y + height + 5;
}

/**
 * Draw right column with label and boxes (35-40% width)
 */
function drawRightColumn(
    doc: InstanceType<typeof PDFDocument>,
    wine: Wine,
    labelImageData: Buffer | null,
    x: number,
    startY: number,
    width: number,
    maxY: number
): number {
    let y = startY;

    // 1) ETICHETTA (Label image - large, top-aligned)
    y = drawLabelImage(doc, labelImageData, x, y, width);
    y += 20;

    // 2) BOX DATI ANALITICI
    y = drawAnalyticalDataBox(doc, wine, x, y, width);
    y += 15;

    // 3) BOX SERVIZIO (optional, if we have service data)
    // For now, skip as it's not in the wine model

    return y;
}

/**
 * Draw label image in right column
 */
function drawLabelImage(
    doc: InstanceType<typeof PDFDocument>,
    labelImageData: Buffer | null,
    x: number,
    y: number,
    width: number
): number {
    // Calculate image dimensions (maintain aspect ratio, max height)
    const maxImageHeight = 400;
    const imageWidth = width;
    const imageHeight = maxImageHeight;

    // Border box (thin border)
    doc
        .rect(x, y, imageWidth, imageHeight)
        .strokeColor(COLORS.border)
        .lineWidth(0.8)
        .stroke();

    if (labelImageData) {
        try {
            // Embed image buffer - maintain aspect ratio
            doc.image(labelImageData, x + 5, y + 5, {
                fit: [imageWidth - 10, imageHeight - 10],
                align: "center",
                valign: "top",
            });
        } catch (error) {
            console.error("Error embedding label image:", error);
            drawPlaceholder(doc, x, y, imageWidth, imageHeight);
        }
    } else {
        drawPlaceholder(doc, x, y, imageWidth, imageHeight);
    }

    return y + imageHeight;
}

/**
 * Draw placeholder when no label image
 */
function drawPlaceholder(
    doc: InstanceType<typeof PDFDocument>,
    x: number,
    y: number,
    width: number,
    height: number
) {
    doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor(COLORS.lightGray)
        .text("Etichetta non disponibile", x + width / 2, y + height / 2 - 5, {
            align: "center",
            width: width,
        });
}

/**
 * Draw Analytical Data box
 */
function drawAnalyticalDataBox(
    doc: InstanceType<typeof PDFDocument>,
    wine: Wine,
    x: number,
    y: number,
    width: number
): number {
    const boxPadding = 12;
    const lineHeight = 16;
    let currentY = y;

    // Calculate content height
    const fields: Array<{ label: string; value: string | null }> = [
        {
            label: "Grado alcolico",
            value: wine.abv ? `${wine.abv}% vol.` : null,
        },
        { label: "Quantità", value: wine.quantity ? `${wine.quantity} bottiglie` : null },
        {
            label: "Prezzo",
            value: wine.price
                ? `${wine.price.toFixed(2)} ${wine.currency || "EUR"}`
                : null,
        },
        { label: "Posizione", value: wine.location || null },
    ];

    const visibleFields = fields.filter((f) => f.value);
    const contentHeight = boxPadding * 2 + 20 + visibleFields.length * lineHeight;

    // Box border (thin)
    doc
        .rect(x, currentY, width, contentHeight)
        .fillColor(COLORS.white)
        .fill()
        .strokeColor(COLORS.border)
        .lineWidth(0.8)
        .stroke();

    currentY += boxPadding;

    // Title
    doc
        .fontSize(10)
        .font("Times-Bold")
        .fillColor(COLORS.bordeaux)
        .text("DATI ANALITICI", x + boxPadding, currentY);
    currentY += 18;

    // Fields
    for (const field of visibleFields) {
        doc
            .fontSize(8)
            .font("Times-Bold")
            .fillColor(COLORS.black)
            .text(`${field.label.toUpperCase()}:`, x + boxPadding, currentY);
        doc
            .fontSize(9)
            .font("Times-Roman")
            .fillColor(COLORS.black)
            .text(field.value!, x + boxPadding, currentY + 12, {
                width: width - boxPadding * 2,
            });
        currentY += lineHeight + 8;
    }

    return y + contentHeight;
}

/**
 * Draw footer with generation date and pagination
 */
function drawFooter(
    doc: InstanceType<typeof PDFDocument>,
    pageHeight: number,
    pageWidth: number,
    margin: number
) {
    const footerY = pageHeight - 30;

    // Thin divider
    doc
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .moveTo(margin, footerY - 10)
        .lineTo(pageWidth - margin, footerY - 10)
        .stroke();

    // Footer text
    const date = new Date().toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const footerText = `Scheda tecnica generata da CellarWine · ${date}`;

    doc
        .fontSize(7)
        .font("Times-Roman")
        .fillColor(COLORS.gray)
        .text(footerText, margin, footerY, {
            width: pageWidth - margin * 2,
            align: "center",
        });
}
