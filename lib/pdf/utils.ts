import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import type { Wine, Tasting } from "@/types/db";

// Patch fs.readFileSync BEFORE importing PDFKit to fix font path issues in Next.js
// PDFKit uses __dirname + '/data/font.afm' which fails in Next.js App Router
// We intercept font file reads and redirect to correct absolute paths
let fsPatched = false;
let fontDataPath: string | null = null;

function patchFsForPDFKit() {
    if (fsPatched) return;

    try {
        // In Next.js/Turbopack, require.resolve can return incorrect paths
        // Use process.cwd() as the primary method to find the correct font data path
        const cwd = process.cwd();
        const fontDataPathOption1 = path.join(cwd, "node_modules", "pdfkit", "js", "data");

        // Fallback: Try using require.resolve if process.cwd() doesn't work
        let fontDataPathOption2: string | null = null;
        try {
            const pdfKitPath = require.resolve("pdfkit");
            const pdfKitDir = path.dirname(pdfKitPath);
            // Clean up any [project] or other Next.js artifacts from the path
            const cleanedPath = pdfKitPath.replace(/\[project\]/g, "").replace(/\/\/+/g, "/");
            const cleanedDir = path.dirname(cleanedPath);
            fontDataPathOption2 = path.resolve(cleanedDir, "data");
        } catch {
            // If require.resolve fails, use only process.cwd() method
        }

        // Try process.cwd() method first (most reliable in Next.js)
        if (fs.existsSync(fontDataPathOption1)) {
            fontDataPath = fontDataPathOption1;
            console.log(`PDFKit font patch: using font path (process.cwd): ${fontDataPath}`);
        } else if (fontDataPathOption2 && fs.existsSync(fontDataPathOption2)) {
            fontDataPath = fontDataPathOption2;
            console.log(`PDFKit font patch: using font path (require.resolve): ${fontDataPath}`);
        } else {
            console.error(`PDFKit font data path not found. Tried:`);
            console.error(`  1. ${fontDataPathOption1} (exists: ${fs.existsSync(fontDataPathOption1)})`);
            if (fontDataPathOption2) {
                console.error(`  2. ${fontDataPathOption2} (exists: ${fs.existsSync(fontDataPathOption2)})`);
            }
            return;
        }

        const originalReadFileSync = fs.readFileSync.bind(fs);
        const originalExistsSync = fs.existsSync.bind(fs);

        // Helper function to get correct font path
        const getCorrectFontPath = (filePath: string): string | null => {
            if (typeof filePath === 'string' && filePath.endsWith('.afm') && fontDataPath) {
                const fontFileName = path.basename(filePath);
                return path.join(fontDataPath, fontFileName);
            }
            return null;
        };

        // Patch fs.existsSync to intercept font path checks
        (fs as any).existsSync = function (filePath: fs.PathLike): boolean {
            if (typeof filePath === 'string' && filePath.endsWith('.afm')) {
                // Check for /ROOT/ path FIRST - this is always wrong in Next.js
                if (filePath.includes('/ROOT/')) {
                    const correctPath = getCorrectFontPath(filePath);
                    if (correctPath && originalExistsSync(correctPath)) {
                        console.log(`PDFKit existsSync fix (/ROOT/): ${filePath} -> ${correctPath}`);
                        return true;
                    }
                    return false;
                }

                // Check if correct path exists (for non-existent requested paths)
                const correctPath = getCorrectFontPath(filePath);
                if (correctPath && !originalExistsSync(filePath) && originalExistsSync(correctPath)) {
                    console.log(`PDFKit existsSync fix (path doesn't exist): ${filePath} -> ${correctPath}`);
                    return true;
                }
            }
            return originalExistsSync(filePath);
        };

        // Patch fs.readFileSync to intercept font file reads
        (fs as any).readFileSync = function (filePath: string | number | Buffer | URL, encoding?: any) {
            if (typeof filePath === 'string' && filePath.endsWith('.afm') && fontDataPath) {
                const fontFileName = path.basename(filePath);
                const correctPath = path.join(fontDataPath, fontFileName);

                // CRITICAL: Check for /ROOT/ path FIRST before any other checks
                // PDFKit uses __dirname + '/data/font.afm' which resolves incorrectly in Next.js
                // Next.js sets __dirname to /ROOT/cellarwine-web/... which doesn't exist
                if (filePath.includes('/ROOT/')) {
                    if (originalExistsSync(correctPath)) {
                        console.log(`PDFKit font path fix (/ROOT/): ${filePath} -> ${correctPath}`);
                        return originalReadFileSync(correctPath, encoding);
                    }
                    // If correct path doesn't exist either, throw error
                    throw new Error(`Font file not found: ${fontFileName}. Requested: ${filePath}, Correct: ${correctPath}`);
                }

                // Check if requested path exists
                const pathExists = originalExistsSync(filePath);
                const correctPathExists = originalExistsSync(correctPath);

                // If requested path doesn't exist but correct path does, use correct path
                if (!pathExists && correctPathExists) {
                    console.log(`PDFKit font path fix (path doesn't exist): ${filePath} -> ${correctPath}`);
                    return originalReadFileSync(correctPath, encoding);
                }

                // If requested path exists, try it first
                if (pathExists) {
                    try {
                        return originalReadFileSync(filePath, encoding);
                    } catch (error: any) {
                        // If original path fails with ENOENT, try correct path
                        if (error.code === 'ENOENT' && correctPathExists) {
                            console.log(`PDFKit font path fix (ENOENT): ${filePath} -> ${correctPath}`);
                            return originalReadFileSync(correctPath, encoding);
                        }
                        throw error;
                    }
                }

                // Neither exists - throw helpful error
                throw new Error(`Font file not found: ${fontFileName}. Requested: ${filePath}, Correct: ${correctPath}`);
            }

            // Use original behavior for all other files
            try {
                return originalReadFileSync(filePath, encoding);
            } catch (error: any) {
                // If error is ENOENT for a font file (even if not detected earlier), try correct path
                if (error.code === 'ENOENT' && typeof filePath === 'string' && filePath.endsWith('.afm') && fontDataPath) {
                    const fontFileName = path.basename(filePath);
                    const correctPath = path.join(fontDataPath, fontFileName);
                    if (originalExistsSync(correctPath)) {
                        console.log(`PDFKit font path fix (ENOENT fallback): ${filePath} -> ${correctPath}`);
                        return originalReadFileSync(correctPath, encoding);
                    }
                }
                throw error;
            }
        };

        fsPatched = true;
        console.log(`PDFKit font patch: fs patched successfully`);
    } catch (patchError) {
        console.error("Error patching fs for PDFKit:", patchError);
    }
}

// Patch fs BEFORE requiring PDFKit
patchFsForPDFKit();

// Function to get PDFDocument constructor - ensures patch is applied first
function getPDFDocumentConstructor() {
    // Ensure patch is applied
    if (!fsPatched) {
        patchFsForPDFKit();
    }

    // Now require PDFKit after patch is applied
    const PDFDocumentModule = require("pdfkit");
    // Handle both CommonJS and ES module exports (default for ESM, direct for CJS)
    const PDFDocumentConstructor = PDFDocumentModule.default || PDFDocumentModule;
    return PDFDocumentConstructor as any;
}

// Export PDFDocument as a constructor
// We export a function that creates the constructor to ensure patch is applied
// This is necessary because in Next.js, modules are loaded differently
export const PDFDocument = getPDFDocumentConstructor();

// Colors
export const COLORS = {
    black: "#000000",
    white: "#FFFFFF",
    bordeaux: "#5A1A23", // Updated to match requirements
    gray: "#666666",
    lightGray: "#cccccc",
    border: "#E5E5E5",
};

export async function generateQRCode(url: string): Promise<Buffer> {
    return await QRCode.toBuffer(url, {
        errorCorrectionLevel: "M",
        type: "png",
        width: 200,
        margin: 1,
    });
}

// Use Times fonts directly - these are standard PDF fonts that work without external files
// PDFKit has issues with Helvetica font path resolution in Next.js App Router
// Times-Roman, Times-Bold work reliably without path issues

export function addHeader(doc: InstanceType<typeof PDFDocument>, title: string) {
    doc.fillColor(COLORS.bordeaux);
    doc.fontSize(24).font("Times-Bold").text(title, 50, 50, { align: "center" });
    doc.moveDown(0.5);
}

export function addSection(doc: InstanceType<typeof PDFDocument>, title: string, y: number): number {
    doc.fillColor(COLORS.bordeaux);
    doc.fontSize(16).font("Times-Bold").text(title, 50, y);
    doc.strokeColor(COLORS.bordeaux).lineWidth(1).moveTo(50, y + 20).lineTo(550, y + 20).stroke();
    return y + 35;
}

export function addField(
    doc: InstanceType<typeof PDFDocument>,
    label: string,
    value: string | number | null | undefined,
    y: number,
    maxWidth: number = 500
): number {
    if (value === null || value === undefined || value === "") {
        return y;
    }

    doc.fillColor(COLORS.black);
    doc.fontSize(10).font("Times-Bold").text(`${label}:`, 50, y);
    doc.font("Times-Roman").fillColor(COLORS.gray).text(String(value), 50, y + 15, { width: maxWidth });
    return y + 35;
}

export function addQRCode(doc: InstanceType<typeof PDFDocument>, qrBuffer: Buffer, y: number) {
    if (!qrBuffer || qrBuffer.length === 0) {
        return; // Skip if buffer is empty
    }
    try {
        doc.image(qrBuffer, 450, y, { width: 100, height: 100 });
    } catch (error) {
        console.error("Error adding QR code image to PDF:", error);
        // Continue without QR code
    }
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

