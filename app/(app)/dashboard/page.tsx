import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { carregarContextoAcesso } from "@/lib/services/acesso";
import { resumoDoMes } from "@/lib/services/dashboard";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarMoeda } from "@/lib/utils/formatacao";

type Props = { searchParams: { erro?: string } };

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

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

  const unidadeAtual = lerUnidadeAtual(ctx.unidades);
  const unidadeId = unidadeIdOuNull(unidadeAtual);
  const nomeUnidade = unidadeId ? ctx.unidades.find((u) => u.id === unidadeId)?.nome : "Todas as Unidades";

  const resumo = await resumoDoMes(createClient(), unidadeId);
  const agora = new Date();
  const mesAtual = `${MESES[agora.getMonth()]} de ${agora.getFullYear()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {nomeUnidade} · {mesAtual}
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
          <CardContent className="text-2xl font-semibold">{formatarMoeda(resumo.resultado)}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
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
      </section>
    </div>
  );
}
