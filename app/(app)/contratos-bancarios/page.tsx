import Link from "next/link";

import { StatusContratoBadge } from "@/components/contratos-bancarios/status-badge";
import { Mensagens } from "@/components/mensagens";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarContratos, type StatusContrato } from "@/lib/services/contratos-bancarios";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarData, formatarMoeda } from "@/lib/utils/formatacao";
import { STATUS_CONTRATO, TIPOS_CONTRATO } from "@/lib/validacao/contrato-bancario";

type Busca = { status?: string; ok?: string; erro?: string };

const TEXTOS_OK = { excluido: "Contrato excluído." };

export default async function ContratosPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("bank_contracts", "view");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades));
  const status = (Object.keys(STATUS_CONTRATO) as StatusContrato[]).find((s) => s === searchParams.status);
  const supabase = createClient();
  const lista = await listarContratos(supabase, unidadeId, status);
  const ativos = status ? await listarContratos(supabase, unidadeId, "active") : lista.filter((c) => c.status === "active");
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  const saldoDevedor = ativos.reduce((s, c) => s + c.progresso.valorPendente, 0);
  const emAtraso = ativos.reduce((s, c) => s + c.progresso.atrasadas, 0);
  const contratado = ativos.reduce((s, c) => s + c.principal, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contratos Bancários</h1>
          <p className="text-sm text-muted-foreground">
            {unidadeId ? nomeUnidade.get(unidadeId) : "Todas as Unidades"} · empréstimos, capital de giro, consórcios e rotativos
          </p>
        </div>
        {pode(ctx, "bank_contracts", "create") ? (
          <Button asChild>
            <Link href="/contratos-bancarios/novo">Novo contrato</Link>
          </Button>
        ) : null}
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Contratado (ativos)</CardTitle>
            <CardDescription>{ativos.length} {ativos.length === 1 ? "contrato ativo" : "contratos ativos"}</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">{formatarMoeda(contratado)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Saldo a pagar</CardTitle>
            <CardDescription>Parcelas pendentes</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold text-amber-700">{formatarMoeda(saldoDevedor)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Parcelas em atraso</CardTitle>
            <CardDescription>Nos contratos ativos</CardDescription>
          </CardHeader>
          <CardContent className={`text-xl font-semibold ${emAtraso > 0 ? "text-red-700" : ""}`}>{emAtraso}</CardContent>
        </Card>
      </section>

      <form method="get" className="flex max-w-xs items-end gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="status" className="text-xs text-muted-foreground">Mostrar</label>
          <SelectNativo id="status" name="status" defaultValue={status ?? ""}>
            <option value="">Todos</option>
            {(Object.keys(STATUS_CONTRATO) as StatusContrato[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_CONTRATO[s]}
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
              <TableHead>Contrato</TableHead>
              {!unidadeId ? <TableHead>Unidade</TableHead> : null}
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Parcelas</TableHead>
              <TableHead>Próximo venc.</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 ? (
              <TableRow>
                <TableCell colSpan={unidadeId ? 8 : 9} className="py-10 text-center text-muted-foreground">
                  Nenhum contrato {status ? "com esse status" : "cadastrado"}.
                </TableCell>
              </TableRow>
            ) : (
              lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.institution}</div>
                    <div className="text-xs text-muted-foreground">#{c.contract_number} · {formatarData(c.contract_date)}</div>
                  </TableCell>
                  {!unidadeId ? <TableCell className="text-muted-foreground">{nomeUnidade.get(c.business_unit_id) ?? "—"}</TableCell> : null}
                  <TableCell>{TIPOS_CONTRATO[c.contract_type]}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(c.principal)}</TableCell>
                  <TableCell>{c.installments_count ? `${c.progresso.pagas}/${c.installments_count}` : `${c.progresso.pagas} pagas`}</TableCell>
                  <TableCell>{c.progresso.proximoVencimento ? formatarData(c.progresso.proximoVencimento) : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{formatarMoeda(c.progresso.valorPendente)}</TableCell>
                  <TableCell><StatusContratoBadge status={c.status} atrasadas={c.progresso.atrasadas} /></TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/contratos-bancarios/${c.id}`}>Detalhes</Link>
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
