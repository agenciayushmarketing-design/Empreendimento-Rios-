import Link from "next/link";

import { StatusEmprestimoBadge } from "@/components/emprestimos/status-badge";
import { Mensagens } from "@/components/mensagens";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarEmprestimos, resumir } from "@/lib/services/emprestimos";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarData, formatarMoeda } from "@/lib/utils/formatacao";

type Busca = { status?: string; ok?: string; erro?: string };

const TEXTOS_OK = { excluido: "Empréstimo excluído." };

export default async function EmprestimosPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("loans", "view");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const status = (["active", "paid_off", "defaulted"] as const).find((s) => s === searchParams.status);
  const lista = await listarEmprestimos(createClient(), unidadeId, status);
  const resumo = resumir(status ? await listarEmprestimos(createClient(), unidadeId) : lista);
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));
  const podeCriar = pode(ctx, "loans", "create");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empréstimos</h1>
          <p className="text-sm text-muted-foreground">{unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"} · quem tomou, quanto falta, quem atrasou</p>
        </div>
        {podeCriar ? (
          <Button asChild>
            <Link href="/emprestimos/novo">Novo empréstimo</Link>
          </Button>
        ) : null}
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <section className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Emprestado (ativos)</CardTitle>
            <CardDescription>{resumo.ativos} {resumo.ativos === 1 ? "empréstimo" : "empréstimos"}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(resumo.emprestadoAtivo)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>A receber</CardTitle>
            <CardDescription>Parcelas em aberto</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-amber-700">{formatarMoeda(resumo.aReceber)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Em atraso</CardTitle>
            <CardDescription>Parcelas vencidas</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-red-700">{formatarMoeda(resumo.atrasado)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recebido no mês</CardTitle>
            <CardDescription>Parcelas baixadas</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-emerald-700">{formatarMoeda(resumo.recebidoNoMes)}</CardContent>
        </Card>
      </section>

      <form method="get" className="flex max-w-xs items-end gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="status" className="text-xs text-muted-foreground">Mostrar</label>
          <SelectNativo id="status" name="status" defaultValue={status ?? ""}>
            <option value="">Todos</option>
            <option value="active">Ativos</option>
            <option value="defaulted">Inadimplentes</option>
            <option value="paid_off">Quitados</option>
          </SelectNativo>
        </div>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tomador</TableHead>
              {!unidadeId ? <TableHead>Unidade</TableHead> : null}
              <TableHead className="text-right">Emprestado</TableHead>
              <TableHead>Juros</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>Próximo venc.</TableHead>
              <TableHead className="text-right">Saldo devedor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 ? (
              <TableRow>
                <TableCell colSpan={unidadeId ? 8 : 9} className="py-10 text-center text-muted-foreground">
                  Nenhum empréstimo {status ? "com esse status" : "cadastrado"}.
                </TableCell>
              </TableRow>
            ) : (
              lista.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.clienteNome}</TableCell>
                  {!unidadeId ? <TableCell className="text-muted-foreground">{nomeUnidade.get(e.business_unit_id) ?? "—"}</TableCell> : null}
                  <TableCell className="text-right">{formatarMoeda(e.principal)}</TableCell>
                  <TableCell>{(e.monthly_rate * 100).toLocaleString("pt-BR", { maximumFractionDigits: 3 })}% a.m.</TableCell>
                  <TableCell>{e.pagas}/{e.term_months}</TableCell>
                  <TableCell>{e.proximoVencimento ? formatarData(e.proximoVencimento) : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{formatarMoeda(e.saldoDevedor)}</TableCell>
                  <TableCell><StatusEmprestimoBadge status={e.status} atrasado={e.atrasado} /></TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/emprestimos/${e.id}`}>Parcelas</Link>
                    </Button>
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
