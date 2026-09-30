import Link from "next/link";
import { notFound } from "next/navigation";

import { BotaoExcluir } from "@/components/botao-excluir";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { obterEmprestimo } from "@/lib/services/emprestimos";
import { createClient } from "@/lib/supabase/server";
import { formatarData, formatarMoeda, hojeISO } from "@/lib/utils/formatacao";
import { alterarStatusEmprestimo, estornarParcela, excluirEmprestimo } from "../actions";
import { StatusEmprestimoBadge } from "@/components/emprestimos/status-badge";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK = {
  criado: "Empréstimo cadastrado. As parcelas foram geradas.",
  recebida: "Parcela recebida. A movimentação de entrada foi criada.",
  estornada: "Parcela reaberta e movimentação removida.",
  inadimplente: "Empréstimo marcado como inadimplente.",
  reativado: "Empréstimo reativado.",
};

export default async function EmprestimoPage({ params, searchParams }: { params: { id: string }; searchParams: Busca }) {
  const ctx = await exigirPermissao("loans", "view");
  const e = await obterEmprestimo(createClient(), params.id);
  if (!e) notFound();

  const hoje = hojeISO();
  const podeEditar = pode(ctx, "loans", "edit");
  const podeExcluir = pode(ctx, "loans", "delete");
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));
  const totalParcelas = e.parcelas.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empréstimo · {e.clienteNome}</h1>
          <p className="text-sm text-muted-foreground">
            {nomeUnidade.get(e.business_unit_id) ?? ""} · concedido em {formatarData(e.start_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusEmprestimoBadge status={e.status} atrasado={e.atrasado} />
          <Button asChild variant="ghost" size="sm">
            <Link href="/emprestimos">Voltar</Link>
          </Button>
        </div>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <section className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle>Emprestado</CardTitle></CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(e.principal)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total a receber</CardTitle>
            <CardDescription>{e.term_months}x de {formatarMoeda(e.parcelas[0]?.amount ?? 0)} · {(e.monthly_rate * 100).toLocaleString("pt-BR", { maximumFractionDigits: 3 })}% a.m.</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(totalParcelas)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Saldo devedor</CardTitle>
            <CardDescription>{e.pagas} de {e.term_months} pagas</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-amber-700">{formatarMoeda(e.saldoDevedor)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle>Em atraso</CardTitle></CardHeader>
          <CardContent className="text-xl font-semibold text-red-700">{formatarMoeda(e.atrasado)}</CardContent>
        </Card>
      </section>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Nº</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recebida em</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {e.parcelas.map((p) => {
              const atrasada = p.status === "overdue" || (p.status === "pending" && p.due_date < hoje);
              const aberta = p.status === "pending" || p.status === "overdue";
              return (
                <TableRow key={p.id}>
                  <TableCell>{p.installment_number}/{e.term_months}</TableCell>
                  <TableCell>{formatarData(p.due_date)}</TableCell>
                  <TableCell className="text-right font-medium">{formatarMoeda(p.amount)}</TableCell>
                  <TableCell>
                    {p.status === "paid" ? <Badge variant="sucesso">Recebida</Badge> : atrasada ? <Badge variant="erro">Atrasada</Badge> : aberta ? <Badge variant="alerta">A vencer</Badge> : <Badge variant="secondary">{p.status}</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.paid_at ? formatarData(p.paid_at.slice(0, 10)) : "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {podeEditar && aberta ? (
                        <Button asChild size="sm">
                          <Link href={`/emprestimos/${e.id}/parcelas/${p.installment_number}/receber`}>Receber</Link>
                        </Button>
                      ) : null}
                      {podeEditar && p.status === "paid" ? (
                        <form action={estornarParcela}>
                          <input type="hidden" name="loan_id" value={e.id} />
                          <input type="hidden" name="numero" value={p.installment_number} />
                          <Button type="submit" variant="ghost" size="sm">Estornar</Button>
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

      {podeEditar || podeExcluir ? (
        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          {podeEditar && e.status !== "paid_off" ? (
            <form action={alterarStatusEmprestimo}>
              <input type="hidden" name="id" value={e.id} />
              <input type="hidden" name="status" value={e.status === "defaulted" ? "active" : "defaulted"} />
              <Button type="submit" variant="outline" size="sm">
                {e.status === "defaulted" ? "Reativar empréstimo" : "Marcar como inadimplente"}
              </Button>
            </form>
          ) : null}
          {podeExcluir && e.pagas === 0 ? (
            <BotaoExcluir
              action={excluirEmprestimo}
              id={e.id}
              voltar="/emprestimos"
              rotulo="Excluir empréstimo"
              mensagem="Excluir este empréstimo e todas as parcelas? Use para corrigir um cadastro errado."
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
