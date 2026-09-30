import { redirect } from "next/navigation";

import { FormularioUsuario } from "@/components/equipe/formulario";
import { carregarContextoAcesso } from "@/lib/services/acesso";
import { temChaveSecreta } from "@/lib/supabase/admin";
import { criarUsuario } from "../actions";

export default async function NovoUsuarioPage() {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/dashboard?erro=sem-acesso");
  if (!temChaveSecreta()) redirect("/equipe?erro=" + encodeURIComponent("Criar usuário exige a SUPABASE_SECRET_KEY no servidor."));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo usuário</h1>
        <p className="text-sm text-muted-foreground">Crie o acesso, escolha as unidades e o que a pessoa pode fazer em cada módulo.</p>
      </div>
      <FormularioUsuario
        unidades={ctx.unidades}
        action={criarUsuario}
        textoBotao="Criar usuário"
        modo="criar"
        valores={{ full_name: "", email: "", role: "member", is_active: true, unidades: [], permissoes: ["dashboard:view"] }}
      />
    </div>
  );
}
