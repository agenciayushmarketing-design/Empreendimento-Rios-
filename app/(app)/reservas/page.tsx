import Link from "next/link";

import { BotaoExcluir } from "@/components/botao-excluir";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarReservas, STATUS_RESERVA, type StatusReserva } from "@/lib/services/reservas";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { deslocarMes, formatarData, formatarMes, formatarMoeda, mesAtualISO } from "@/lib/utils/formatacao";
import { alterarStatusReserva, excluirReserva } from "./actions";

type Busca = { mes?: string; status?: string; ok?: string; erro?: string };

const TEXTOS_OK: Record<string, string> = {
  criada: "Reserva registrada como pendente.",
  confirmada: "Reserva confirmada. A conta a receber foi criada.",
  atualizada: "Reserva atualizada.",
  cancelada: "Reserva cancelada. A conta a receber pendente foi removida.",
  concluida: "Reserva concluída.",
  excluida: "Reserva excluída.",
};

function StatusBadge({ status }: { status: StatusReserva }) {
  const variante = status === "confirmed" ? "sucesso" : status === "pending" ? "alerta" : status === "cancelled" ? "erro" : "secondary";
  return <Badge variant={variante}>{STATUS_RESERVA[status]}</Badge>;
}

function montarUrl(b: Busca, mudancas: Partial<Busca>) {
  const p = new URLSearchParams();
  const f = { ...b, ...mudancas };
  if (f.mes) p.set("mes", f.mes);
  if (f.status) p.set("status", f.status);
  const s = p.toString();
  return s ? `/reservas?${s}` : "/reservas";
}

export default async function ReservasPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("reservations", "view");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const mes = searchParams.mes === "todas" ? null : /^\d{4}-\d{2}$/.test(searchParams.mes ?? "") ? searchParams.mes! : mesAtualISO();
  const status = (["pending", "confirmed", "cancelled", "completed"] as const).find((s) => s === searchParams.status);
  const reservas = await listarReservas(createClient(), unidadeId, mes, status);
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  const podeCriar = pode(ctx, "reservations", "create");
  const podeEditar = pode(ctx, "reservations", "edit");
  const podeExcluir = pode(ctx, "reservations", "delete");
  const urlAtual = montarUrl(searchParams, {});

  const confirmadas = reservas.filter((r) => r.status === "confirmed");
  const pendentes = reservas.filter((r) => r.status === "pending");
  const valorConfirmado = confirmadas.reduce((s, r) => s + r.total_amount, 0);
  const valorPendente = pendentes.reduce((s, r) => s + r.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservas</h1>
          <p className="text-sm text-muted-foreground">
            {unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"} · {mes ? formatarMes(mes) : "todas as datas"}
          </p>
        </div>
        {podeCriar ? (
          <Button asChild>
            <Link href="/reservas/nova">Nova reserva</Link>
          </Button>
        ) : null}
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Confirmadas</CardTitle>
            <CardDescription>{confirmadas.length} {confirmadas.length === 1 ? "reserva" : "reservas"}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-emerald-700">{formatarMoeda(valorConfirmado)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pendentes</CardTitle>
            <CardDescription>{pendentes.length} aguardando confirmação</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-amber-700">{formatarMoeda(valorPendente)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total no período</CardTitle>
            <CardDescription>Confirmadas e pendentes</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(valorConfirmado + valorPendente)}</CardContent>
        </Card>
      </section>

      <form method="get" className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-[auto_auto_auto]">
        <div className="space-y-1">
          <label htmlFor="mes" className="text-xs text-muted-foreground">Mês</label>
          <div className="flex items-center gap-1">
            <Button asChild variant="outline" size="sm" aria-label="Mês anterior">
              <Link href={montarUrl(searchParams, { mes: deslocarMes(mes ?? mesAtualISO(), -1) })}>&lsaquo;</Link>
            </Button>
            <Input id="mes" name="mes" type="month" defaultValue={mes ?? ""} className="w-[160px]" />
            <Button asChild variant="outline" size="sm" aria-label="Próximo mês">
              <Link href={montarUrl(searchParams, { mes: deslocarMes(mes ?? mesAtualISO(), 1) })}>&rsaquo;</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={montarUrl(searchParams, { mes: "todas" })}>Todas</Link>
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="text-xs text-muted-foreground">Situação</label>
          <SelectNativo id="status" name="status" defaultValue={status ?? ""} className="w-[160px]">
            <option value="">Todas</option>
            {(Object.keys(STATUS_RESERVA) as StatusReserva[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_RESERVA[s]}
              </option>
            ))}
          </SelectNativo>
        </div>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead>Reserva</TableHead>
              {!unidadeId ? <TableHead>Unidade</TableHead> : null}
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={unidadeId ? 6 : 7} className="py-10 text-center text-muted-foreground">
                  Nenhuma reserva {mes ? `em ${formatarMes(mes)}` : ""} com esses filtros.
                </TableCell>
              </TableRow>
            ) : (
              reservas.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatarData(r.start_date)}
                    {r.end_date !== r.start_date ? ` a ${formatarData(r.end_date)}` : ""}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{r.title}</div>
                    <div className="flex flex-wrap gap-1 pt-1 text-xs text-muted-foreground">
                      {r.notes ? <span>{r.notes}</span> : null}
                      {r.receivable_id ? (
                        <Badge variant="outline">{r.recebivelStatus === "paid" ? "Recebida" : "Conta a receber criada"}</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  {!unidadeId ? <TableCell className="text-muted-foreground">{nomeUnidade.get(r.business_unit_id) ?? "—"}</TableCell> : null}
                  <TableCell className="text-muted-foreground">{r.clienteNome ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{formatarMoeda(r.total_amount)}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {podeEditar && r.status === "pending" ? (
                        <form action={alterarStatusReserva}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="confirmed" />
                          <input type="hidden" name="voltar" value={urlAtual} />
                          <Button type="submit" size="sm">Confirmar</Button>
                        </form>
                      ) : null}
                      {podeEditar && r.status === "confirmed" ? (
                        <form action={alterarStatusReserva}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="completed" />
                          <input type="hidden" name="voltar" value={urlAtual} />
                          <Button type="submit" variant="outline" size="sm">Concluir</Button>
                        </form>
                      ) : null}
                      {podeEditar && (r.status === "pending" || r.status === "confirmed") ? (
                        <>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/reservas/${r.id}/editar`}>Editar</Link>
                          </Button>
                          <form action={alterarStatusReserva}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <input type="hidden" name="voltar" value={urlAtual} />
                            <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">Cancelar</Button>
                          </form>
                        </>
                      ) : null}
                      {podeExcluir && (r.status === "pending" || r.status === "cancelled") ? (
                        <BotaoExcluir action={excluirReserva} id={r.id} voltar={urlAtual} mensagem={`Excluir a reserva "${r.title}"?`} />
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
