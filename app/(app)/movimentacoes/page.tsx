import Link from "next/link";

import { BotaoExcluir } from "@/components/movimentacoes/botao-excluir";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { urlsAssinadas } from "@/lib/services/comprovantes";
import { listarMovimentacoes, POR_PAGINA, type MovimentacaoLinha } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { deslocarMes, formatarData, formatarMes, formatarMoeda, mesAtualISO } from "@/lib/utils/formatacao";
import { alternarStatus } from "./actions";

type Busca = { mes?: string; tipo?: string; status?: string; q?: string; pagina?: string; ok?: string; erro?: string };

const MENSAGENS_OK: Record<string, string> = {
  criada: "Movimentação registrada.",
  atualizada: "Movimentação atualizada.",
  excluida: "Movimentação excluída.",
};

function montarUrl(b: Busca, mudancas: Partial<Busca>): string {
  const p = new URLSearchParams();
  const final = { ...b, ...mudancas };
  for (const k of ["mes", "tipo", "status", "q", "pagina"] as const) {
    const v = final[k];
    if (v) p.set(k, v);
  }
  const s = p.toString();
  return s ? `/movimentacoes?${s}` : "/movimentacoes";
}

function StatusBadge({ linha }: { linha: MovimentacaoLinha }) {
  if (linha.status === "paid") return <Badge variant="sucesso">Pago</Badge>;
  if (linha.status === "pending") return <Badge variant="alerta">Pendente</Badge>;
  return <Badge variant="secondary">{linha.status}</Badge>;
}

export default async function MovimentacoesPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("cash_flow", "view");
  const supabase = createClient();

  const mes = /^\d{4}-\d{2}$/.test(searchParams.mes ?? "") ? searchParams.mes! : mesAtualISO();
  const tipo = searchParams.tipo === "income" || searchParams.tipo === "expense" ? searchParams.tipo : undefined;
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);
  const unidadeAtual = lerUnidadeAtual(ctx.unidades);
  const unidadeId = unidadeIdOuNull(unidadeAtual);

  const { linhas, total, totais } = await listarMovimentacoes(supabase, {
    unidadeId,
    mes,
    tipo,
    status: searchParams.status,
    busca: searchParams.q?.trim() || undefined,
    pagina,
  });

  const urlsComprovante = await urlsAssinadas(supabase, linhas.map((l) => l.attachment_url ?? "").filter(Boolean));
  const urlExportar = montarUrl(searchParams, {}).replace("/movimentacoes", "/movimentacoes/exportar");

  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));
  const podeCriar = pode(ctx, "cash_flow", "create");
  const podeEditar = pode(ctx, "cash_flow", "edit");
  const podeExcluir = pode(ctx, "cash_flow", "delete");
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const urlAtual = montarUrl(searchParams, {});
  const colunas = unidadeId ? 7 : 8;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Movimentações</h1>
          <p className="text-sm text-muted-foreground">
            {unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"} · {formatarMes(mes)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href={urlExportar} download>
              Exportar CSV
            </a>
          </Button>
          {podeCriar ? (
            <Button asChild>
              <Link href="/movimentacoes/nova">Nova movimentação</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {searchParams.ok && MENSAGENS_OK[searchParams.ok] ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          {MENSAGENS_OK[searchParams.ok]}
        </p>
      ) : null}
      {searchParams.erro ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {searchParams.erro}
        </p>
      ) : null}

      <form method="get" className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-[auto_auto_auto_1fr_auto]">
        <div className="space-y-1">
          <label htmlFor="mes" className="text-xs text-muted-foreground">
            Mês
          </label>
          <div className="flex items-center gap-1">
            <Button asChild variant="outline" size="sm" aria-label="Mês anterior">
              <Link href={montarUrl(searchParams, { mes: deslocarMes(mes, -1), pagina: undefined })}>&lsaquo;</Link>
            </Button>
            <Input id="mes" name="mes" type="month" defaultValue={mes} className="w-[160px]" />
            <Button asChild variant="outline" size="sm" aria-label="Próximo mês">
              <Link href={montarUrl(searchParams, { mes: deslocarMes(mes, 1), pagina: undefined })}>&rsaquo;</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="tipo" className="text-xs text-muted-foreground">
            Tipo
          </label>
          <SelectNativo id="tipo" name="tipo" defaultValue={tipo ?? ""} className="w-[150px]">
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </SelectNativo>
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="text-xs text-muted-foreground">
            Status
          </label>
          <SelectNativo id="status" name="status" defaultValue={searchParams.status ?? ""} className="w-[150px]">
            <option value="">Todos</option>
            <option value="paid">Pagos</option>
            <option value="pending">Pendentes</option>
          </SelectNativo>
        </div>
        <div className="space-y-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">
            Buscar na descrição
          </label>
          <Input id="q" name="q" defaultValue={searchParams.q ?? ""} placeholder="Ex.: aluguel" />
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      <section className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Receitas pagas</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-emerald-700">{formatarMoeda(totais.receitasPagas)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Despesas pagas</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-red-700">{formatarMoeda(totais.despesasPagas)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Saldo do período</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(totais.saldo)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pendentes</CardTitle>
            <CardDescription>Ainda não pagos</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-amber-700">{formatarMoeda(totais.pendentes)}</CardContent>
        </Card>
      </section>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Data</TableHead>
              <TableHead>Descrição</TableHead>
              {!unidadeId ? <TableHead>Unidade</TableHead> : null}
              <TableHead>Categoria</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colunas} className="py-10 text-center text-muted-foreground">
                  Nenhuma movimentação em {formatarMes(mes)} com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              linhas.map((l) => {
                const editavel = !l.is_transfer;
                const alternavel = podeEditar && editavel && (l.status === "paid" || l.status === "pending");
                return (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">{formatarData(l.date)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{l.description}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {l.is_transfer ? <Badge variant="secondary">Transferência</Badge> : null}
                        {l.is_adjustment ? <Badge variant="secondary">Ajuste</Badge> : null}
                        {l.reconciled_at ? <Badge variant="outline">Conciliada</Badge> : null}
                        {l.closed_at ? <Badge variant="outline">Período fechado</Badge> : null}
                        {l.client?.name ? <span className="text-xs text-muted-foreground">{l.client.name}</span> : null}
                        {l.attachment_url && urlsComprovante.get(l.attachment_url) ? (
                          <a
                            href={urlsComprovante.get(l.attachment_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline underline-offset-4"
                          >
                            Comprovante
                          </a>
                        ) : null}
                      </div>
                    </TableCell>
                    {!unidadeId ? (
                      <TableCell className="text-muted-foreground">{nomeUnidade.get(l.business_unit_id) ?? "—"}</TableCell>
                    ) : null}
                    <TableCell className="text-muted-foreground">{l.category?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.bank_account?.name ?? "—"}</TableCell>
                    <TableCell
                      className={`whitespace-nowrap text-right font-medium ${l.type === "income" ? "text-emerald-700" : "text-red-700"}`}
                    >
                      {l.type === "income" ? "+" : "-"} {formatarMoeda(l.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge linha={l} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {alternavel ? (
                          <form action={alternarStatus}>
                            <input type="hidden" name="id" value={l.id} />
                            <input type="hidden" name="status" value={l.status === "paid" ? "pending" : "paid"} />
                            <input type="hidden" name="voltar" value={urlAtual} />
                            <Button type="submit" variant="ghost" size="sm">
                              {l.status === "paid" ? "Marcar pendente" : "Marcar pago"}
                            </Button>
                          </form>
                        ) : null}
                        {podeEditar && editavel ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/movimentacoes/${l.id}/editar`}>Editar</Link>
                          </Button>
                        ) : null}
                        {podeExcluir && editavel ? <BotaoExcluir id={l.id} voltar={urlAtual} /> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPaginas > 1 ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} movimentações · página {pagina} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            {pagina > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={montarUrl(searchParams, { pagina: String(pagina - 1) })}>Anterior</Link>
              </Button>
            ) : null}
            {pagina < totalPaginas ? (
              <Button asChild variant="outline" size="sm">
                <Link href={montarUrl(searchParams, { pagina: String(pagina + 1) })}>Próxima</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
