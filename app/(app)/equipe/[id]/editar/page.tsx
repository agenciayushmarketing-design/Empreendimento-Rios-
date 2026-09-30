import { notFound, redirect } from "next/navigation";

import { FormularioUsuario } from "@/components/equipe/formulario";
import { FormularioSenha } from "@/components/equipe/formulario-senha";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { carregarContextoAcesso } from "@/lib/services/acesso";
import { obterUsuario } from "@/lib/services/equipe";
import { temChaveSecreta } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { atualizarUsuario, redefinirSenha } from "../../actions";

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/dashboard?erro=sem-acesso");

  const usuario = await obterUsuario(createClient(), params.id);
  if (!usuario) notFound();
  const proprio = usuario.id === ctx.userId;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar usuário</h1>
        <p className="text-sm text-muted-foreground">{usuario.email}</p>
      </div>
      <FormularioUsuario
        unidades={ctx.unidades}
        action={atualizarUsuario.bind(null, usuario.id)}
        textoBotao="Salvar alterações"
        modo="editar"
        proprioUsuario={proprio}
        valores={{
          full_name: usuario.nome,
          email: usuario.email,
          role: usuario.isAdmin ? "admin" : "member",
          is_active: usuario.ativo,
          unidades: usuario.unidades,
          permissoes: usuario.permissoes,
        }}
      />

      {!proprio ? (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Redefinir senha</CardTitle>
            <CardDescription>Define uma senha provisória. A pessoa é obrigada a trocar no próximo login.</CardDescription>
          </CardHeader>
          <CardContent>
            {temChaveSecreta() ? (
              <FormularioSenha action={redefinirSenha.bind(null, usuario.id)} />
            ) : (
              <p className="text-sm text-muted-foreground">Indisponível: falta a SUPABASE_SECRET_KEY no servidor.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
