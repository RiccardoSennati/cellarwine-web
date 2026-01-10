import { GlassCard, SectionHeader, Badge } from "@/components/glass";
import { getAllTastings } from "@/features/tasting/actions";
import { deleteTasting } from "@/features/tasting/actions";
import { TastingsList } from "@/features/tasting/TastingsList";
import { Star, Calendar, MapPin, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default async function TastingsPage() {
  const tastings = await getAllTastings();

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Degustazioni"
        subtitle="Le tue degustazioni e note"
      />
      <TastingsList tastings={tastings} />
    </div>
  );
}
