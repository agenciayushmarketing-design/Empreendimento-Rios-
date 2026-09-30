import Link from "next/link";

import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarFuncionarios } from "@/lib/services/funcionarios";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarData, formatarMoeda } from "@/lib/utils/formatacao";
import { alternarAtivoFuncionario } from "./actions";

type Busca = { arquivados?: string; ok?: string; erro?: string };

const TEXTOS_OK = {
  criado: "Funcionário cadastrado.",
  atualizado: "Funcionário atualizado.",
  arquivado: "Funcionário arquivado. Ele sai da folha, mas o histórico continua.",
  reativado: "Funcionário reativado.",
};

export default async function FuncionariosPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("employees", "view");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const incluirArquivados = searchParams.arquivados === "1";
  const lista = await listarFuncionarios(createClient(), unidadeId, incluirArquivados);
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  const podeCriar = pode(ctx, "employees", "create");
  const podeEditar = pode(ctx, "employees", "edit");
  const podeFolha = pode(ctx, "payables", "create");
  const ativos = lista.filter((f) => f.is_active);
  const folhaEstimada = ativos.reduce((s, f) => s + f.liquido, 0);
  const voltar = incluirArquivados ? "/funcionarios?arquivados=1" : "/funcionarios";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funcionários</h1>
          <p className="text-sm text-muted-foreground">{unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"} · equipe e folha mensal</p>
        </div>
        <div className="flex items-center gap-2">
          {podeFolha ? (
            <Button asChild variant="outline">
              <Link href="/funcionarios/folha">Gerar folha do mês</Link>
            </Button>
          ) : null}
          {podeCriar ? (
            <Button asChild>
              <Link href="/funcionarios/novo">Novo funcionário</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Funcionários ativos</CardTitle>
            <CardDescription>{unidadeId ? "Nesta unidade" : "Em todas as unidades"}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{ativos.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Folha mensal estimada</CardTitle>
            <CardDescription>Soma do líquido padrão dos ativos</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(folhaEstimada)}</CardContent>
        </Card>
      </section>

      <div className="text-sm">
        <Link href={incluirArquivados ? "/funcionarios" : "/funcionarios?arquivados=1"} className="text-muted-foreground underline-offset-4 hover:underline">
          {incluirArquivados ? "Ocultar arquivados" : "Mostrar arquivados"}
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              {!unidadeId ? <TableHead>Unidade</TableHead> : null}
              <TableHead>Função</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead className="text-right">Salário base</TableHead>
              <TableHead className="text-right">Líquido estimado</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 ? (
              <TableRow>
                <TableCell colSpan={unidadeId ? 6 : 7} className="py-10 text-center text-muted-foreground">
                  Nenhum funcionário cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              lista.map((f) => (
                <TableRow key={f.id} className={f.is_active ? "" : "opacity-60"}>
                  <TableCell>
                    <div className="font-medium">{f.full_name}</div>
                    {!f.is_active ? <Badge variant="secondary">Arquivado</Badge> : null}
                  </TableCell>
                  {!unidadeId ? <TableCell className="text-muted-foreground">{nomeUnidade.get(f.business_unit_id) ?? "—"}</TableCell> : null}
                  <TableCell className="text-muted-foreground">{f.role ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{f.admission_date ? formatarData(f.admission_date) : "—"}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(f.default_base_salary)}</TableCell>
                  <TableCell className="text-right font-medium">{formatarMoeda(f.liquido)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {podeEditar ? (
                        <>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/funcionarios/${f.id}/editar`}>Editar</Link>
                          </Button>
                          <form action={alternarAtivoFuncionario}>
                            <input type="hidden" name="id" value={f.id} />
                            <input type="hidden" name="ativo" value={f.is_active ? "false" : "true"} />
                            <input type="hidden" name="voltar" value={voltar} />
                            <Button type="submit" variant="ghost" size="sm" className={f.is_active ? "text-destructive hover:text-destructive" : ""}>
                              {f.is_active ? "Arquivar" : "Reativar"}
                            </Button>
                          </form>
                        </>
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
