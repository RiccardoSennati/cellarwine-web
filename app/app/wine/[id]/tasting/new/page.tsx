import { notFound, redirect } from "next/navigation";
import { TastingWizard } from "@/features/tasting/TastingWizard";
import { getWineWithDetails } from "@/features/wine/actions";
import { duplicateTasting } from "@/features/tasting/actions";
import { SectionHeader } from "@/components/glass";

interface NewTastingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ duplicate?: string }>;
}

export default async function NewTastingPage({
  params,
  searchParams,
}: NewTastingPageProps) {
  const { id } = await params;
  const { duplicate } = await searchParams;

  // Verify wine exists and user has access
  const wine = await getWineWithDetails(id);
  if (!wine) {
    notFound();
  }

  // Load duplicate data if requested
  let initialData = undefined;
  if (duplicate) {
    try {
      initialData = await duplicateTasting(duplicate);
    } catch (error) {
      console.error("Error duplicating tasting:", error);
      // Continue without initial data
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Nuova Degustazione"
        subtitle={`Aggiungi una nuova degustazione per ${wine.name}`}
      />
      <TastingWizard wineId={id} initialData={initialData} />
    </div>
  );
}

