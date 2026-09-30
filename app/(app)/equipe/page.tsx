import Link from "next/link";
import { redirect } from "next/navigation";

import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MODULOS } from "@/lib/modulos";
import { carregarContextoAcesso } from "@/lib/services/acesso";
import { listarUsuarios } from "@/lib/services/equipe";
import { temChaveSecreta } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { alternarAtivoUsuario } from "./actions";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK = {
  criado: "Usuário criado. Passe a senha provisória para a pessoa; ela troca no primeiro login.",
  atualizado: "Usuário atualizado.",
  senha: "Senha provisória definida. A pessoa troca no próximo login.",
  desativado: "Usuário desativado. Ele não consegue mais entrar.",
  reativado: "Usuário reativado.",
};

export default async function EquipePage({ searchParams }: { searchParams: Busca }) {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/dashboard?erro=sem-acesso");

  const usuarios = await listarUsuarios(createClient());
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));
  const rotuloModulo = new Map(MODULOS.map((m) => [m.chave, m.rotulo]));
  const chaveOk = temChaveSecreta();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipe e Acessos</h1>
          <p className="text-sm text-muted-foreground">Quem entra no sistema e o que cada pessoa vê.</p>
        </div>
        <Button asChild disabled={!chaveOk}>
          <Link href="/equipe/nova">Novo usuário</Link>
        </Button>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      {!chaveOk ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Criar usuário e redefinir senha exigem a variável <code>SUPABASE_SECRET_KEY</code> no servidor (Vercel, só Production e Preview).
          Editar acessos e desativar funcionam sem ela.
        </p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pessoa</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Unidades</TableHead>
              <TableHead>Módulos</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => {
              const modulos = Array.from(new Set(u.permissoes.map((p) => p.split(":")[0])));
              const souEu = u.id === ctx.userId;
              return (
                <TableRow key={u.id} className={u.ativo ? "" : "opacity-60"}>
                  <TableCell>
                    <div className="font-medium">
                      {u.nome}
                      {souEu ? <span className="ml-2 text-xs text-muted-foreground">(você)</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {!u.ativo ? <Badge variant="secondary">Inativo</Badge> : null}
                      {u.senhaProvisoria ? <Badge variant="alerta">Senha provisória</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>{u.isAdmin ? <Badge>Administrador</Badge> : <Badge variant="outline">Membro</Badge>}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.isAdmin ? "Todas" : u.unidades.length === 0 ? "Nenhuma" : u.unidades.map((id) => nomeUnidade.get(id) ?? "?").join(", ")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.isAdmin ? "Todos" : modulos.length === 0 ? "Nenhum" : modulos.map((m) => rotuloModulo.get(m as never) ?? m).join(", ")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/equipe/${u.id}/editar`}>Editar</Link>
                      </Button>
                      {!souEu ? (
                        <form action={alternarAtivoUsuario}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="ativo" value={u.ativo ? "false" : "true"} />
                          <Button type="submit" variant="ghost" size="sm" className={u.ativo ? "text-destructive hover:text-destructive" : ""}>
                            {u.ativo ? "Desativar" : "Reativar"}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
