import Link from "next/link";
import { redirect } from "next/navigation";

import { GraficoTendencia, GraficoUnidades } from "@/components/dashboard/graficos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { carregarContextoAcesso, pode } from "@/lib/services/acesso";
import { proximosVencimentos, resumoDoMes, resumoPorUnidade, tendenciaMeses } from "@/lib/services/dashboard";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarData, formatarMes, formatarMoeda, mesAtualISO } from "@/lib/utils/formatacao";

type Props = { searchParams: { erro?: string } };

const MES_CURTO = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function rotuloMes(mes: string) {
  const [a, m] = mes.split("-");
  return `${MES_CURTO[Number(m) - 1]}/${a.slice(2)}`;
}

function LinhaAberto({ rotulo, qtd, total, destaque }: { rotulo: string; qtd: number; total: number; destaque?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>
        {rotulo} ({qtd})
      </span>
      <span className={destaque ? "font-medium text-red-700" : "font-medium"}>{formatarMoeda(total)}</span>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: Props) {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");

  const supabase = createClient();
  const unidadeAtual = lerUnidadeAtual(ctx.unidades);
  const unidadeId = unidadeIdOuNull(unidadeAtual);
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));
  const tituloUnidade = unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades";
  const mes = mesAtualISO();

  const podeVerCaixa = pode(ctx, "cash_flow", "view");
  const podeVerPagar = pode(ctx, "payables", "view");
  const podeVerReceber = pode(ctx, "receivables", "view");

  const [resumo, porUnidade, tendencia, vencimentos] = await Promise.all([
    resumoDoMes(supabase, unidadeId, mes),
    !unidadeId && ctx.unidades.length > 1 ? resumoPorUnidade(supabase, mes) : Promise.resolve([]),
    tendenciaMeses(supabase, unidadeId, 6),
    proximosVencimentos(supabase, unidadeId, 7, 10),
  ]);

  // Toda unidade visivel aparece no grafico, mesmo com zero no mes.
  const dadosUnidades = ctx.unidades.map((u) => {
    const l = porUnidade.find((x) => x.unidadeId === u.id);
    return { nome: u.nome, receitas: l?.receitas ?? 0, despesas: l?.despesas ?? 0, resultado: (l?.receitas ?? 0) - (l?.despesas ?? 0) };
  });
  const temMovimento = tendencia.some((p) => p.receitas > 0 || p.despesas > 0);
  const dadosTendencia = tendencia.map((p) => ({ ...p, mes: rotuloMes(p.mes) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {tituloUnidade} · {formatarMes(mes)}
        </p>
      </div>

      {searchParams.erro === "sem-acesso" ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          Você não tem acesso a esse módulo. Peça ao administrador para liberar.
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Receitas do mês</CardTitle>
            <CardDescription>Entradas pagas</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-700">{formatarMoeda(resumo.receitas)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Despesas do mês</CardTitle>
            <CardDescription>Saídas pagas</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-red-700">{formatarMoeda(resumo.despesas)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resultado do mês</CardTitle>
            <CardDescription>Receitas menos despesas</CardDescription>
          </CardHeader>
          <CardContent className={`text-2xl font-semibold ${resumo.resultado < 0 ? "text-red-700" : ""}`}>{formatarMoeda(resumo.resultado)}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {(podeVerReceber || podeVerPagar) ? (
          <Card>
            <CardHeader>
              <CardTitle>Próximos 7 dias</CardTitle>
              <CardDescription>Contas em aberto vencendo em breve, e as já atrasadas</CardDescription>
            </CardHeader>
            <CardContent>
              {vencimentos.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Nada vencendo nos próximos 7 dias.</p>
              ) : (
                <ul className="divide-y text-sm">
                  {vencimentos.map((v) => (
                    <li key={`${v.tipo}-${v.id}`} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{v.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatarData(v.due_date)}
                          {!unidadeId ? ` · ${nomeUnidade.get(v.business_unit_id) ?? ""}` : ""}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {v.atrasada ? <Badge variant="erro">Atrasada</Badge> : <Badge variant={v.tipo === "pagar" ? "alerta" : "sucesso"}>{v.tipo === "pagar" ? "Pagar" : "Receber"}</Badge>}
                        <span className={`font-medium ${v.tipo === "pagar" ? "text-red-700" : "text-emerald-700"}`}>{formatarMoeda(v.amount)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2 pt-3">
                {podeVerPagar ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/contas-a-pagar">Contas a pagar</Link>
                  </Button>
                ) : null}
                {podeVerReceber ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/contas-a-receber">Contas a receber</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quem está me devendo</CardTitle>
              <CardDescription>Contas a receber em aberto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <LinhaAberto rotulo="Atrasadas" qtd={resumo.aReceber.atrasadas} total={resumo.aReceber.totalAtrasado} destaque />
              <LinhaAberto rotulo="A vencer" qtd={resumo.aReceber.pendentes} total={resumo.aReceber.totalPendente} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>O que eu devo</CardTitle>
              <CardDescription>Contas a pagar em aberto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <LinhaAberto rotulo="Atrasadas" qtd={resumo.aPagar.atrasadas} total={resumo.aPagar.totalAtrasado} destaque />
              <LinhaAberto rotulo="A vencer" qtd={resumo.aPagar.pendentes} total={resumo.aPagar.totalPendente} />
            </CardContent>
          </Card>
        </div>
      </section>

      {podeVerCaixa ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {!unidadeId && ctx.unidades.length > 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Qual negócio rende mais</CardTitle>
                <CardDescription>Receitas e despesas pagas em {formatarMes(mes)}, por unidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GraficoUnidades dados={dadosUnidades} />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Receitas</TableHead>
                      <TableHead className="text-right">Despesas</TableHead>
                      <TableHead className="text-right">Resultado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosUnidades.map((u) => (
                      <TableRow key={u.nome}>
                        <TableCell className="font-medium">{u.nome}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(u.receitas)}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(u.despesas)}</TableCell>
                        <TableCell className={`text-right font-medium ${u.resultado < 0 ? "text-red-700" : ""}`}>{formatarMoeda(u.resultado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          <Card className={!unidadeId && ctx.unidades.length > 1 ? "" : "lg:col-span-2"}>
            <CardHeader>
              <CardTitle>Últimos 6 meses</CardTitle>
              <CardDescription>Receitas e despesas pagas por mês{unidadeId ? ` · ${tituloUnidade}` : ""}</CardDescription>
            </CardHeader>
            <CardContent>
              {temMovimento ? (
                <GraficoTendencia dados={dadosTendencia} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Ainda não há lançamentos pagos nos últimos 6 meses. O gráfico aparece a partir do primeiro.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
