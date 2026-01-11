"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GlassCard, GlassInput, GlassButton, SectionHeader } from "@/components/glass";
import { GlassBackground } from "@/components/glass/GlassBackground";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const redirectTo = searchParams.get("redirectTo") || "/app";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      // Usa NEXT_PUBLIC_SITE_URL se disponibile (configurato in Vercel), altrimenti usa window.location.origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        // Mostra il messaggio di errore specifico di Supabase
        console.error("Supabase auth error:", error);
        setMessage({
          type: "error",
          text: error.message || "Si è verificato un errore. Riprova."
        });
      } else {
        setMessage({
          type: "success",
          text: "Controlla la tua email per il link di accesso!",
        });
      }
    } catch (error) {
      // Cattura errori generici (es. problemi di rete, variabili d'ambiente mancanti)
      console.error("Login error:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Si è verificato un errore. Verifica la configurazione di Supabase.";
      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground>
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <GlassCard variant="elevated">
            <SectionHeader
              title="Accedi a CellarWine"
              subtitle="Inserisci la tua email per ricevere il link di accesso"
            />

            <form onSubmit={handleLogin} className="space-y-6">
              <GlassInput
                label="Email"
                type="email"
                placeholder="nome@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              {message && (
                <div
                  className={`rounded-lg p-3 text-sm ${message.type === "success"
                    ? "bg-[var(--accent-muted)] text-[var(--accent-primary)] border border-[var(--accent-primary)]"
                    : "bg-[var(--surface-elevated)] text-[var(--accent-primary)] border border-[var(--accent-primary)]"
                    }`}
                >
                  {message.text}
                </div>
              )}

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Invio in corso..." : "Invia link di accesso"}
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </GlassBackground>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <GlassBackground>
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <GlassCard variant="elevated">
              <div className="text-center text-[var(--text-secondary)]">
                Caricamento...
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassBackground>
    }>
      <LoginForm />
    </Suspense>
  );
}

