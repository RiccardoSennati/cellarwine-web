import { notFound } from "next/navigation";
import { TastingWizard } from "@/features/tasting/TastingWizard";
import { getWineWithDetails } from "@/features/wine/actions";
import { getTastingById, duplicateTasting } from "@/features/tasting/actions";
import { SectionHeader } from "@/components/glass";

interface EditTastingPageProps {
    params: Promise<{ id: string; tastingId: string }>;
}

export default async function EditTastingPage({
    params,
}: EditTastingPageProps) {
    const { id, tastingId } = await params;

    // Verify wine exists and user has access
    const wine = await getWineWithDetails(id);
    if (!wine) {
        notFound();
    }

    // Load tasting data for editing
    const tasting = await getTastingById(tastingId);
    if (!tasting || tasting.wine_id !== id) {
        notFound();
    }

    // Convert tasting to form data format
    // Handle type conversions between DB (TEXT) and form schema (number/enum)
    const initialData: any = {
        tasting_date: new Date(tasting.tasting_date),
        occasion: tasting.occasion || undefined,
        location: tasting.location || undefined,
        // Convert serving_temperature from string (DB) to number (form schema)
        serving_temperature: tasting.serving_temperature
            ? (isNaN(parseFloat(tasting.serving_temperature)) ? undefined : parseFloat(tasting.serving_temperature))
            : undefined,
        decanting_time: tasting.decanting_time || undefined,
        color: tasting.color || undefined,
        intensity: tasting.intensity || undefined,
        appearance_notes: tasting.appearance_notes || undefined,
        aroma_intensity: tasting.aroma_intensity || undefined,
        aromatic_families: tasting.aromatic_families || [],
        aroma_notes: tasting.aroma_notes || undefined,
        rating: tasting.rating || undefined,
        textures: tasting.textures || [],
        sweetness: tasting.sweetness || undefined,
        acidity: tasting.acidity || undefined,
        tannins: tasting.tannins || undefined,
        body: tasting.body || undefined,
        finish: tasting.finish || undefined,
        taste_notes: tasting.taste_notes || undefined,
        faults: tasting.faults || [],
        overall_notes: tasting.overall_notes || undefined,
        food_pairing: tasting.food_pairing || [],
        is_draft: tasting.is_draft ?? false,
    };

    return (
        <div className="space-y-8">
            <SectionHeader
                title="Modifica Degustazione"
                subtitle={`Modifica la degustazione del ${new Date(tasting.tasting_date).toLocaleDateString("it-IT")} per ${wine.name}`}
            />
            <TastingWizard
                wineId={id}
                tastingId={tastingId}
                initialData={initialData}
            />
        </div>
    );
}

