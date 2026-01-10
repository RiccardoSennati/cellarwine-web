import Link from "next/link";
import { GlassCard, GlassButton } from "@/components/glass";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <GlassCard variant="elevated" className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Vino non trovato
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Il vino che stai cercando non esiste o non hai i permessi per
          visualizzarlo.
        </p>
        <Link href="/app/inventory">
          <GlassButton variant="primary">Torna all&apos;Inventory</GlassButton>
        </Link>
      </GlassCard>
    </div>
  );
}

