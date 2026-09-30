import Link from "next/link";

import { FormularioCategoria } from "@/components/categorias/formulario";
import { BotaoExcluir } from "@/components/botao-excluir";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarCategorias } from "@/lib/services/cadastros";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { criarCategoria, excluirCategoria } from "./actions";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK = { criada: "Categoria criada.", atualizada: "Categoria atualizada.", excluida: "Categoria excluída." };

export default async function CategoriasPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("categories", "view");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const categorias = await listarCategorias(createClient(), unidadeId);
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  const podeCriar = pode(ctx, "categories", "create");
  const podeEditar = pode(ctx, "categories", "edit");
  const podeExcluir = pode(ctx, "categories", "delete");

  // Agrupa por unidade para a lista ficar legivel em "Todas as Unidades".
  const grupos = new Map<string, typeof categorias>();
  for (const c of categorias) {
    const lista = grupos.get(c.business_unit_id) ?? [];
    lista.push(c);
    grupos.set(c.business_unit_id, lista);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
        <p className="text-sm text-muted-foreground">
          {unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"} · plano de contas de cada negócio
        </p>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      {podeCriar ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Nova categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <FormularioCategoria
              unidades={ctx.unidades}
              action={criarCategoria}
              textoBotao="Adicionar"
              compacto
              valores={{ business_unit_id: unidadeId ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : ""), name: "", type: "expense" }}
            />
          </CardContent>
        </Card>
      ) : null}

      {categorias.length === 0 ? (
        <p className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
          Nenhuma categoria cadastrada ainda. Comece pelas despesas mais comuns: aluguel, luz, água, internet.
        </p>
      ) : (
        Array.from(grupos.entries()).map(([bu, lista]) => (
          <div key={bu} className="rounded-lg border">
            <div className="border-b bg-muted/40 px-4 py-2 text-sm font-medium">{nomeUnidade.get(bu) ?? "Unidade"}</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-[130px]">Tipo</TableHead>
                  <TableHead className="w-[1%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="font-medium">{c.name}</span>
                      {c.is_payroll ? (
                        <Badge variant="outline" className="ml-2">
                          Folha de pagamento
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {c.type === "income" ? <Badge variant="sucesso">Receita</Badge> : <Badge variant="erro">Despesa</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/categorias/${c.id}/editar`}>Editar</Link>
                          </Button>
                        ) : null}
                        {podeExcluir && !c.is_payroll ? (
                          <BotaoExcluir
                            action={excluirCategoria}
                            id={c.id}
                            voltar="/categorias"
                            mensagem={`Excluir a categoria "${c.name}"? Lançamentos ligados a ela ficam sem categoria.`}
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))
      )}
    </div>
  );
}
