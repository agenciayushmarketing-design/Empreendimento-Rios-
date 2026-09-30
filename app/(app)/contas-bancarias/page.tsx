import Link from "next/link";

import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { listarContasBancarias } from "@/lib/services/cadastros";
import { createClient } from "@/lib/supabase/server";
import { formatarData, formatarMoeda } from "@/lib/utils/formatacao";
import { TIPOS_CONTA } from "@/lib/validacao/cadastros";
import { alternarAtivaContaBancaria } from "./actions";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK = {
  criada: "Conta cadastrada.",
  atualizada: "Conta atualizada.",
  desativada: "Conta desativada. Ela some das opções de lançamento, mas o histórico continua.",
  reativada: "Conta reativada.",
};

export default async function ContasBancariasPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("bank_accounts", "view");
  const contas = await listarContasBancarias(createClient());
  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));

  const podeCriar = pode(ctx, "bank_accounts", "create");
  const podeEditar = pode(ctx, "bank_accounts", "edit");
  const ativas = contas.filter((c) => c.is_active);
  const saldoTotal = ativas.reduce((s, c) => s + c.saldo, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contas Bancárias</h1>
          <p className="text-sm text-muted-foreground">Onde o dinheiro está. Saldo = saldo inicial + lançamentos pagos.</p>
        </div>
        {podeCriar ? (
          <Button asChild>
            <Link href="/contas-bancarias/nova">Nova conta</Link>
          </Button>
        ) : null}
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Saldo total das contas ativas</CardTitle>
          <CardDescription>
            {ativas.length} {ativas.length === 1 ? "conta ativa" : "contas ativas"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{formatarMoeda(saldoTotal)}</CardContent>
      </Card>

      {contas.length === 0 ? (
        <p className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
          Nenhuma conta cadastrada. Cadastre a conta principal e o caixa físico para começar.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contas.map((c) => (
            <Card key={c.id} className={c.is_active ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: c.color ?? "#1E3A5F" }} />
                    <CardTitle className="text-base">{c.name}</CardTitle>
                  </div>
                  {!c.is_active ? <Badge variant="secondary">Inativa</Badge> : null}
                </div>
                <CardDescription>
                  {TIPOS_CONTA[c.type]}
                  {c.bank_name ? ` · ${c.bank_name}` : ""}
                  {c.agency || c.account_number ? ` · ${[c.agency, c.account_number].filter(Boolean).join(" / ")}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-2xl font-semibold ${c.saldo < 0 ? "text-red-700" : ""}`}>{formatarMoeda(c.saldo)}</div>
                <div className="text-xs text-muted-foreground">
                  {c.movimentacoes > 0
                    ? `${c.movimentacoes} lançamentos · último em ${formatarData(c.ultimaMovimentacao)}`
                    : `Sem lançamentos · saldo inicial em ${formatarData(c.initial_balance_date)}`}
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.unidades.length === 0 ? (
                    <Badge variant="outline">Todas as unidades</Badge>
                  ) : (
                    c.unidades.map((u) => (
                      <Badge key={u} variant="outline">
                        {nomeUnidade.get(u) ?? "Unidade"}
                      </Badge>
                    ))
                  )}
                </div>
                {podeEditar ? (
                  <div className="flex items-center gap-1 pt-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/contas-bancarias/${c.id}/editar`}>Editar</Link>
                    </Button>
                    <form action={alternarAtivaContaBancaria}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="ativa" value={c.is_active ? "false" : "true"} />
                      <Button type="submit" variant="ghost" size="sm" className={c.is_active ? "text-destructive hover:text-destructive" : ""}>
                        {c.is_active ? "Desativar" : "Reativar"}
                      </Button>
                    </form>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
