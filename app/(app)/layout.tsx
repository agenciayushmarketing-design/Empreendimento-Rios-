import { redirect } from "next/navigation";

import { Header } from "@/components/header";
import { listarUnidadesDoUsuario } from "@/lib/services/unidades";
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

  // O trigger handle_new_user() cria o profile no primeiro login; o primeiro usuario vira admin.
  const { data: perfil } = await supabase
    .from("profiles")
    .select("id, full_name, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.is_active) {
    await supabase.auth.signOut();
    redirect("/login?erro=" + encodeURIComponent("Usuario sem perfil ativo. Contate o admin."));
  }

  const unidades = await listarUnidadesDoUsuario(supabase, user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user.email ?? ""} unidades={unidades} />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
