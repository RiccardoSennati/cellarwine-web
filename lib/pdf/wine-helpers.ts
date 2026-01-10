import { createClient } from "@/lib/supabase/server";
import type { Wine } from "@/types/db";

/**
 * Get label image buffer for PDF embedding
 * Returns Buffer or null if no image
 */
export async function getLabelImageData(wine: Wine): Promise<Buffer | null> {
    if (!wine.label_image_path) {
        return null;
    }

    try {
        const supabase = await createClient();

        // Download image as buffer from private bucket
        const { data, error } = await supabase.storage
            .from("labels")
            .download(wine.label_image_path);

        if (error || !data) {
            console.error("Error downloading label image:", error);
            return null;
        }

        // Convert blob to buffer
        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error("Error processing label image:", error);
        return null;
    }
}

/**
 * Format grapes array for display
 */
export function formatGrapes(grapes: any[] | null | undefined): string {
    if (!grapes || !Array.isArray(grapes) || grapes.length === 0) {
        return "";
    }

    return grapes
        .map((g) => {
            if (typeof g === "string") return g;
            if (g.percent) {
                return `${g.name} ${g.percent}%`;
            }
            return g.name;
        })
        .join(", ");
}

/**
 * Capitalize and normalize text
 */
export function normalizeText(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

/**
 * Truncate text to max lines
 */
export function truncateText(
    text: string,
    maxLines: number,
    lineHeight: number = 12
): { text: string; height: number } {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        // Approximate: ~80 chars per line at 10pt font
        if (testLine.length > 80 && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length <= maxLines) {
        return { text: lines.join(" "), height: lines.length * lineHeight };
    }

    const truncated = lines.slice(0, maxLines).join(" ");
    return {
        text: `${truncated}...`,
        height: maxLines * lineHeight,
    };
}

