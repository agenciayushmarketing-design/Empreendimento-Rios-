import Link from "next/link";

import { FormularioCliente } from "@/components/clientes/formulario";
import { BotaoExcluir } from "@/components/botao-excluir";
import { Mensagens } from "@/components/mensagens";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarClientes } from "@/lib/services/cadastros";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { criarCliente, excluirCliente } from "./actions";

type Busca = { q?: string; ok?: string; erro?: string };

const TEXTOS_OK = { criado: "Cliente cadastrado.", atualizado: "Cliente atualizado.", excluido: "Cliente excluído." };

export default async function ClientesPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("clients", "view");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const busca = searchParams.q?.trim() || undefined;
  const clientes = await listarClientes(createClient(), unidadeId, busca);
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  const podeCriar = pode(ctx, "clients", "create");
  const podeEditar = pode(ctx, "clients", "edit");
  const podeExcluir = pode(ctx, "clients", "delete");
  const voltar = busca ? `/clientes?q=${encodeURIComponent(busca)}` : "/clientes";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-muted-foreground">
          {unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"} · clientes, fornecedores, hóspedes e tomadores
        </p>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      {podeCriar ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Novo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <FormularioCliente
              unidades={ctx.unidades}
              action={criarCliente}
              textoBotao="Cadastrar"
              valores={{
                business_unit_id: unidadeId ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : ""),
                name: "",
                email: "",
                phone: "",
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <form method="get" className="flex max-w-md items-end gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">
            Buscar por nome
          </label>
          <Input id="q" name="q" defaultValue={searchParams.q ?? ""} />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              {!unidadeId ? <TableHead>Unidade</TableHead> : null}
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={unidadeId ? 4 : 5} className="py-10 text-center text-muted-foreground">
                  {busca ? "Nenhum cliente encontrado com esse nome." : "Nenhum cliente cadastrado ainda."}
                </TableCell>
              </TableRow>
            ) : (
              clientes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  {!unidadeId ? <TableCell className="text-muted-foreground">{nomeUnidade.get(c.business_unit_id) ?? "—"}</TableCell> : null}
                  <TableCell className="text-muted-foreground">{c.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {podeEditar ? (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/clientes/${c.id}/editar`}>Editar</Link>
                        </Button>
                      ) : null}
                      {podeExcluir ? (
                        <BotaoExcluir action={excluirCliente} id={c.id} voltar={voltar} mensagem={`Excluir "${c.name}"?`} />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
