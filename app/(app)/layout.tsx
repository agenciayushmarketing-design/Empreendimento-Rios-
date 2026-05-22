import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { Header } from "@/components/header";
import { db } from "@/lib/db";
import { perfis } from "@/lib/db/schema";
import { listarUnidadesAtivas } from "@/lib/services/unidades";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defesa: o middleware ja redireciona, mas mantemos a checagem aqui
  // para que nenhuma rota autenticada carregue sem usuario.
  if (!user) redirect("/login");

  const [perfil] = await db
    .select({ empresaId: perfis.empresaId, nome: perfis.nome })
    .from(perfis)
    .where(eq(perfis.id, user.id));

  if (!perfil) {
    // Usuario logado no Auth mas sem perfil ligado a uma empresa -> desloga.
    await supabase.auth.signOut();
    redirect("/login?erro=" + encodeURIComponent("Usuario sem perfil. Contate o admin."));
  }

  const unidades = await listarUnidadesAtivas(perfil.empresaId);

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user.email ?? ""} unidades={unidades} />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
