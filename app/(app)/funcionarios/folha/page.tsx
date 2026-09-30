import Link from "next/link";

import { FormularioFolha } from "@/components/funcionarios/formulario-folha";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirPermissao, pode } from "@/lib/services/acesso";
import { categoriaFolha, lotesDoMes, previaFolha } from "@/lib/services/funcionarios";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarData, formatarMes, formatarMoeda, limitesDoMesISO, mesAtualISO } from "@/lib/utils/formatacao";
import { desfazerLoteFolha, gerarFolha } from "../actions";

type Busca = { unidade?: string; periodo?: string; ok?: string; erro?: string; criadas?: string; puladas?: string; erros?: string };

export default async function FolhaPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await exigirPermissao("payables", "create");
  const supabase = createClient();
  const periodo = /^\d{4}-\d{2}$/.test(searchParams.periodo ?? "") ? searchParams.periodo! : mesAtualISO();
  const unidadeId =
    ctx.unidades.find((u) => u.id === searchParams.unidade)?.id ??
    unidadeIdOuNull(lerUnidadeAtual(ctx.unidades)) ??
    (ctx.unidades.length === 1 ? ctx.unidades[0].id : null);

  const [previa, lotes, categoria] = unidadeId
    ? await Promise.all([previaFolha(supabase, unidadeId, periodo), lotesDoMes(supabase, unidadeId, periodo), categoriaFolha(supabase, unidadeId)])
    : [[], [], null];

  const nomeUnidade = new Map(ctx.unidades.map((u) => [u.id, u.nome]));
  const { fim } = limitesDoMesISO(periodo);
  const pendentes = previa.filter((p) => !p.already_generated);
  const totalPendente = pendentes.reduce((s, p) => s + p.net_amount, 0);
  const urlAtual = `/funcionarios/folha?unidade=${unidadeId ?? ""}&periodo=${periodo}`;
  const textosOk: Record<string, string> = {
    gerada: `Folha gerada: ${searchParams.criadas ?? 0} conta(s) criada(s)${Number(searchParams.puladas) > 0 ? `, ${searchParams.puladas} já existia(m)` : ""}${Number(searchParams.erros) > 0 ? `, ${searchParams.erros} com erro (sem valores cadastrados)` : ""}. Veja em Contas a Pagar.`,
    desfeito: "Lote desfeito. As contas pendentes foram removidas.",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Folha de pagamento</h1>
          <p className="text-sm text-muted-foreground">Gera uma conta a pagar por funcionário, com proventos e descontos.</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/funcionarios">Voltar</Link>
        </Button>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={textosOk} />

      <form method="get" className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="space-y-1">
          <label htmlFor="unidade" className="text-xs text-muted-foreground">Unidade</label>
          <SelectNativo id="unidade" name="unidade" defaultValue={unidadeId ?? ""} required>
            <option value="">Selecione...</option>
            {ctx.unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-1">
          <label htmlFor="periodo" className="text-xs text-muted-foreground">Mês da folha</label>
          <Input id="periodo" name="periodo" type="month" defaultValue={periodo} className="w-[160px]" />
        </div>
        <Button type="submit" variant="secondary">Ver prévia</Button>
      </form>

      {!unidadeId ? (
        <p className="text-sm text-muted-foreground">Escolha a unidade para ver a prévia.</p>
      ) : (
        <>
          {!categoria ? (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              A unidade {nomeUnidade.get(unidadeId)} não tem categoria de folha de pagamento. Crie uma em Categorias marcando-a como folha.
            </p>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Prévia · {nomeUnidade.get(unidadeId)} · {formatarMes(periodo)}</CardTitle>
              <CardDescription>
                {pendentes.length} funcionário(s) a gerar · {formatarMoeda(totalPendente)} no total. Quem já tem folha neste mês aparece marcado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previa.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">Nenhum funcionário ativo nesta unidade.</p>
              ) : (
                <FormularioFolha
                  unidadeId={unidadeId}
                  periodo={periodo}
                  vencimentoPadrao={fim}
                  previa={previa}
                  podeGerar={Boolean(categoria) && pode(ctx, "payables", "create")}
                  action={gerarFolha}
                />
              )}
            </CardContent>
          </Card>

          {lotes.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Lotes gerados em {formatarMes(periodo)}</CardTitle>
                <CardDescription>Um lote pode ser desfeito enquanto nenhuma conta dele foi paga.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Contas</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[1%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotes.map((l) => (
                      <TableRow key={l.batch_id}>
                        <TableCell className="font-mono text-xs">{l.batch_id.slice(0, 8)}</TableCell>
                        <TableCell>{formatarData(l.vencimento)}</TableCell>
                        <TableCell>
                          {l.qtd} {l.pagas > 0 ? <Badge variant="sucesso" className="ml-1">{l.pagas} paga(s)</Badge> : null}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatarMoeda(l.total)}</TableCell>
                        <TableCell>
                          {l.pagas === 0 && pode(ctx, "payables", "delete") ? (
                            <form action={desfazerLoteFolha}>
                              <input type="hidden" name="batch_id" value={l.batch_id} />
                              <input type="hidden" name="voltar" value={urlAtual} />
                              <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">Desfazer lote</Button>
                            </form>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
