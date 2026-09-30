import Link from "next/link";
import { notFound } from "next/navigation";

import { BotaoExcluir } from "@/components/botao-excluir";
import { StatusContratoBadge } from "@/components/contratos-bancarios/status-badge";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { obterContrato, parcelasDoContrato } from "@/lib/services/contratos-bancarios";
import { createClient } from "@/lib/supabase/server";
import { formatarData, formatarMoeda, hojeISO } from "@/lib/utils/formatacao";
import { STATUS_CONTRATO, TIPOS_CONTRATO } from "@/lib/validacao/contrato-bancario";
import { excluirContrato } from "../actions";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK = {
  criado: "Contrato cadastrado. As parcelas entraram em Contas a Pagar.",
  renegociado: "Contrato renegociado. As parcelas pendentes do antigo foram canceladas e o novo contrato está ativo.",
  quitado: "Contrato quitado. A saída foi registrada e as parcelas pendentes canceladas.",
  lancado: "Lançamento adicionado em Contas a Pagar.",
};

const STATUS_PARCELA: Record<string, { texto: string; variante: "sucesso" | "alerta" | "erro" | "secondary" }> = {
  paid: { texto: "Paga", variante: "sucesso" },
  pending: { texto: "A vencer", variante: "alerta" },
  overdue: { texto: "Atrasada", variante: "erro" },
  cancelled: { texto: "Cancelada", variante: "secondary" },
  renegotiated: { texto: "Renegociada", variante: "secondary" },
};

export default async function ContratoPage({ params, searchParams }: { params: { id: string }; searchParams: Busca }) {
  const ctx = await exigirPermissao("bank_contracts", "view");
  const supabase = createClient();
  const [c, parcelas] = await Promise.all([obterContrato(supabase, params.id), parcelasDoContrato(supabase, params.id)]);
  if (!c) notFound();

  const hoje = hojeISO();
  const podeEditar = pode(ctx, "bank_contracts", "edit");
  const podeExcluir = pode(ctx, "bank_contracts", "delete");
  const podePagar = pode(ctx, "payables", "edit");
  const ativo = c.status === "active";
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{c.institution} · #{c.contract_number}</h1>
          <p className="text-sm text-muted-foreground">
            {TIPOS_CONTRATO[c.contract_type]} · {nomeUnidade.get(c.business_unit_id) ?? ""} · contratado em {formatarData(c.contract_date)}
            {c.interest_rate_info ? ` · ${c.interest_rate_info.toLocaleString("pt-BR")}% a.m.` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusContratoBadge status={c.status} atrasadas={c.progresso.atrasadas} />
          <Button asChild variant="ghost" size="sm">
            <Link href="/contratos-bancarios">Voltar</Link>
          </Button>
        </div>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      {c.renegotiated_from_id ? (
        <p className="text-sm text-muted-foreground">
          Este contrato veio de uma renegociação.{" "}
          <Link href={`/contratos-bancarios/${c.renegotiated_from_id}`} className="underline underline-offset-4">Ver contrato original</Link>
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle>{c.contract_type === "revolving" ? "Limite" : "Contratado"}</CardTitle></CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(c.principal)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pago</CardTitle>
            <CardDescription>{c.installments_count ? `${c.progresso.pagas} de ${c.installments_count} parcelas` : `${c.progresso.pagas} lançamentos`}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-emerald-700">{formatarMoeda(c.progresso.valorPago)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Saldo a pagar</CardTitle>
            <CardDescription>{c.progresso.pendentes} pendentes</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-amber-700">{formatarMoeda(c.progresso.valorPendente)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Situação</CardTitle>
            <CardDescription>{c.settled_at ? `Encerrado em ${formatarData(c.settled_at.slice(0, 10))}` : STATUS_CONTRATO[c.status]}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {c.status === "paid_off" && c.settlement_amount !== null ? formatarMoeda(c.settlement_amount) : c.progresso.pct !== null ? `${c.progresso.pct.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%` : "—"}
          </CardContent>
        </Card>
      </section>

      {podeEditar && ativo ? (
        <div className="flex flex-wrap items-center gap-2">
          {c.contract_type === "revolving" ? (
            <Button asChild size="sm">
              <Link href={`/contratos-bancarios/${c.id}/lancar`}>Lançar no rotativo</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/contratos-bancarios/${c.id}/quitar`}>Quitar antecipado</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/contratos-bancarios/${c.id}/renegociar`}>Renegociar</Link>
          </Button>
          {podeExcluir && parcelas.length === 0 ? (
            <BotaoExcluir action={excluirContrato} id={c.id} voltar="/contratos-bancarios" rotulo="Excluir" mensagem="Excluir este contrato? O crédito do principal, se houver, também será removido." />
          ) : null}
        </div>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Nº</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paga em</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcelas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {c.contract_type === "revolving" ? "Nenhum lançamento ainda." : "Nenhuma parcela."}
                </TableCell>
              </TableRow>
            ) : (
              parcelas.map((p) => {
                const atrasada = p.status === "overdue" || (p.status === "pending" && p.due_date < hoje);
                const st = atrasada && p.status === "pending" ? STATUS_PARCELA.overdue : STATUS_PARCELA[p.status] ?? { texto: p.status, variante: "secondary" as const };
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.installment_number ?? "—"}</TableCell>
                    <TableCell className="font-medium">{p.description}</TableCell>
                    <TableCell>{formatarData(p.due_date)}</TableCell>
                    <TableCell className="text-right font-medium">{formatarMoeda(p.amount)}</TableCell>
                    <TableCell><Badge variant={st.variante}>{st.texto}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{p.paid_at ? formatarData(p.paid_at) : "—"}</TableCell>
                    <TableCell>
                      {podePagar && (p.status === "pending" || p.status === "overdue") ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/contas-a-pagar/${p.id}/baixar`}>Pagar</Link>
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {c.notes ? <p className="whitespace-pre-line text-sm text-muted-foreground">{c.notes}</p> : null}
    </div>
  );
}
