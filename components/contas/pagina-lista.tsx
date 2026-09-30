import Link from "next/link";

import { BotaoExcluir } from "@/components/botao-excluir";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CONTAS, type TipoConta } from "@/lib/contas-config";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarContas, listarRecorrencias, mapasDeNomes, POR_PAGINA, resumoContas, type Conta, type Situacao } from "@/lib/services/contas";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { deslocarMes, formatarData, formatarMes, formatarMoeda, hojeISO, mesAtualISO } from "@/lib/utils/formatacao";
import { encerrarRecorrencia, estornarConta, excluirConta } from "@/app/(app)/contas-actions";

export type BuscaContas = { situacao?: string; mes?: string; q?: string; pagina?: string; ok?: string; erro?: string };

const TEXTOS_OK: Record<string, string> = {
  criada: "Conta registrada.",
  recorrente: "Recorrência criada. Cada conta é gerada automaticamente na data de vencimento.",
  atualizada: "Conta atualizada.",
  excluida: "Conta excluída.",
  baixada: "Baixa registrada. A movimentação de caixa foi criada.",
  estornada: "Baixa estornada. A movimentação de caixa foi removida.",
  recorrencia_encerrada: "Recorrência encerrada. As contas futuras ainda não vencidas foram removidas.",
};

function montarUrl(rota: string, b: BuscaContas, mudancas: Partial<BuscaContas>): string {
  const p = new URLSearchParams();
  const final = { ...b, ...mudancas };
  for (const k of ["situacao", "mes", "q", "pagina"] as const) if (final[k]) p.set(k, final[k]!);
  const s = p.toString();
  return s ? `${rota}?${s}` : rota;
}

function StatusBadge({ c, hoje }: { c: Conta; hoje: string }) {
  if (c.status === "paid") return <Badge variant="sucesso">Paga</Badge>;
  if (c.status === "overdue" || (c.status === "pending" && c.due_date < hoje)) return <Badge variant="erro">Atrasada</Badge>;
  if (c.status === "pending") return <Badge variant="alerta">A vencer</Badge>;
  if (c.status === "renegotiated") return <Badge variant="secondary">Renegociada</Badge>;
  return <Badge variant="secondary">Cancelada</Badge>;
}

export async function PaginaListaContas({ tipo, searchParams }: { tipo: TipoConta; searchParams: BuscaContas }) {
  const cfg = CONTAS[tipo];
  const ctx = await exigirPermissao(cfg.modulo, "view");
  const supabase = createClient();

  const situacao: Situacao = searchParams.situacao === "pagas" || searchParams.situacao === "todas" ? searchParams.situacao : "abertas";
  const mes = /^\d{4}-\d{2}$/.test(searchParams.mes ?? "") ? searchParams.mes! : mesAtualISO();
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const busca = searchParams.q?.trim() || undefined;
  const hoje = hojeISO();

  const [{ linhas, total }, resumo, nomes, recorrencias] = await Promise.all([
    listarContas(supabase, tipo, { unidadeId, situacao, mes, busca, pagina }),
    resumoContas(supabase, tipo, unidadeId, mes),
    mapasDeNomes(supabase),
    cfg.temRecorrencia ? listarRecorrencias(supabase, unidadeId) : Promise.resolve([]),
  ]);

  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));
  const podeCriar = pode(ctx, cfg.modulo, "create");
  const podeEditar = pode(ctx, cfg.modulo, "edit");
  const podeExcluir = pode(ctx, cfg.modulo, "delete");
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const urlAtual = montarUrl(cfg.rota, searchParams, {});
  const excluir = excluirConta.bind(null, tipo);
  const estornar = estornarConta.bind(null, tipo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cfg.titulo}</h1>
          <p className="text-sm text-muted-foreground">
            {unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"}
            {situacao === "abertas" ? " · tudo em aberto" : ` · ${formatarMes(mes)}`}
          </p>
        </div>
        {podeCriar ? (
          <Button asChild>
            <Link href={`${cfg.rota}/nova`}>Nova {cfg.singular}</Link>
          </Button>
        ) : null}
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Atrasadas</CardTitle>
            <CardDescription>{resumo.qtdAtrasadas} {resumo.qtdAtrasadas === 1 ? "conta" : "contas"}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-red-700">{formatarMoeda(resumo.atrasadas)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>A vencer</CardTitle>
            <CardDescription>{resumo.qtdAVencer} {resumo.qtdAVencer === 1 ? "conta" : "contas"}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-amber-700">{formatarMoeda(resumo.aVencer)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{cfg.baixaFeita}s em {formatarMes(mes)}</CardTitle>
            <CardDescription>Baixas no mês</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-emerald-700">{formatarMoeda(resumo.pagasNoMes)}</CardContent>
        </Card>
      </section>

      <form method="get" className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-[auto_auto_1fr_auto]">
        <div className="space-y-1">
          <label htmlFor="situacao" className="text-xs text-muted-foreground">Mostrar</label>
          <SelectNativo id="situacao" name="situacao" defaultValue={situacao} className="w-[170px]">
            <option value="abertas">Em aberto</option>
            <option value="pagas">{cfg.baixaFeita}s no mês</option>
            <option value="todas">Vencendo no mês</option>
          </SelectNativo>
        </div>
        <div className="space-y-1">
          <label htmlFor="mes" className="text-xs text-muted-foreground">Mês</label>
          <div className="flex items-center gap-1">
            <Button asChild variant="outline" size="sm" aria-label="Mês anterior">
              <Link href={montarUrl(cfg.rota, searchParams, { mes: deslocarMes(mes, -1), pagina: undefined })}>&lsaquo;</Link>
            </Button>
            <Input id="mes" name="mes" type="month" defaultValue={mes} className="w-[160px]" />
            <Button asChild variant="outline" size="sm" aria-label="Próximo mês">
              <Link href={montarUrl(cfg.rota, searchParams, { mes: deslocarMes(mes, 1), pagina: undefined })}>&rsaquo;</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">Buscar na descrição</label>
          <Input id="q" name="q" defaultValue={searchParams.q ?? ""} />
        </div>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              {!unidadeId ? <TableHead>Unidade</TableHead> : null}
              <TableHead>{cfg.pessoaRotulo}</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={unidadeId ? 7 : 8} className="py-10 text-center text-muted-foreground">
                  {situacao === "abertas" ? `Nenhuma ${cfg.singular} em aberto.` : `Nenhuma ${cfg.singular} em ${formatarMes(mes)} com esses filtros.`}
                </TableCell>
              </TableRow>
            ) : (
              linhas.map((c) => {
                const aberta = c.status === "pending" || c.status === "overdue";
                return (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap">{formatarData(c.due_date)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{c.description}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {c.recorrente ? <Badge variant="secondary">Recorrente</Badge> : null}
                        {c.closed_at ? <Badge variant="outline">Período fechado</Badge> : null}
                        {c.status === "paid" && c.paid_at ? (
                          <span className="text-xs text-muted-foreground">{cfg.baixaFeita} em {formatarData(c.paid_at)}</span>
                        ) : null}
                      </div>
                    </TableCell>
                    {!unidadeId ? <TableCell className="text-muted-foreground">{nomeUnidade.get(c.business_unit_id) ?? "—"}</TableCell> : null}
                    <TableCell className="text-muted-foreground">{c.pessoa_id ? nomes.pessoas.get(c.pessoa_id) ?? "—" : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.category_id ? nomes.categorias.get(c.category_id) ?? "—" : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">{formatarMoeda(c.amount)}</TableCell>
                    <TableCell><StatusBadge c={c} hoje={hoje} /></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar && aberta ? (
                          <Button asChild size="sm">
                            <Link href={`${cfg.rota}/${c.id}/baixar`}>{cfg.verboBaixa}</Link>
                          </Button>
                        ) : null}
                        {podeEditar && c.status === "paid" ? (
                          <form action={estornar}>
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="voltar" value={urlAtual} />
                            <Button type="submit" variant="ghost" size="sm">Estornar</Button>
                          </form>
                        ) : null}
                        {podeEditar && aberta ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`${cfg.rota}/${c.id}/editar`}>Editar</Link>
                          </Button>
                        ) : null}
                        {podeExcluir && aberta ? (
                          <BotaoExcluir action={excluir} id={c.id} voltar={urlAtual} mensagem={`Excluir "${c.description}"?`} />
                        ) : null}
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
          <span>{total} contas · página {pagina} de {totalPaginas}</span>
          <div className="flex gap-2">
            {pagina > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={montarUrl(cfg.rota, searchParams, { pagina: String(pagina - 1) })}>Anterior</Link>
              </Button>
            ) : null}
            {pagina < totalPaginas ? (
              <Button asChild variant="outline" size="sm">
                <Link href={montarUrl(cfg.rota, searchParams, { pagina: String(pagina + 1) })}>Próxima</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {cfg.temRecorrencia && recorrencias.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Contas recorrentes ativas</CardTitle>
            <CardDescription>Geradas automaticamente todo mês, no dia indicado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  {!unidadeId ? <TableHead>Unidade</TableHead> : null}
                  <TableHead>Dia</TableHead>
                  <TableHead>Próxima</TableHead>
                  <TableHead>Termina</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[1%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recorrencias.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.description}</TableCell>
                    {!unidadeId ? <TableCell className="text-muted-foreground">{nomeUnidade.get(r.business_unit_id) ?? "—"}</TableCell> : null}
                    <TableCell>{r.day_of_month}</TableCell>
                    <TableCell>{formatarData(r.next_run_date)}</TableCell>
                    <TableCell>{r.end_date ? formatarData(r.end_date) : "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatarMoeda(r.amount)}</TableCell>
                    <TableCell>
                      {podeExcluir ? (
                        <BotaoExcluir
                          action={encerrarRecorrencia}
                          id={r.id}
                          voltar={cfg.rota}
                          rotulo="Encerrar"
                          mensagem={`Encerrar a recorrência "${r.description}"? As contas futuras ainda não vencidas serão removidas.`}
                        />
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
