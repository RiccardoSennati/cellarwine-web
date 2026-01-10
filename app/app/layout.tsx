import { AppShell } from "@/components/glass/AppShell";
import { getUser } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica autenticazione (il middleware già protegge, ma qui possiamo usare i dati utente)
  const user = await getUser();

  return <AppShell user={user}>{children}</AppShell>;
}

