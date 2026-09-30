import Link from "next/link";
import { notFound } from "next/navigation";

import { BotaoExcluir } from "@/components/botao-excluir";
import { FormularioLancamentoAnimal, FormularioMovimentacaoAnimal, FormularioPesagem, FormularioSocios } from "@/components/haras/formularios-ficha";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirHaras, SEXO_ANIMAL, STATUS_ANIMAL, STATUS_PARTE } from "@/lib/haras";
import { listarCategoriasHaras, listarClientesHaras, obterAnimal } from "@/lib/services/haras";
import { createClient } from "@/lib/supabase/server";
import { formatarData, formatarMoeda, hojeISO } from "@/lib/utils/formatacao";
import {
  alterarStatusAnimal,
  definirStatusParte,
  excluirAnimal as excluirAnimalAction,
  excluirLancamentoAnimal,
  registrarLancamentoAnimal,
  registrarMovimentacaoAnimal,
  registrarPesagem,
  salvarSocios,
} from "../../actions";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK: Record<string, string> = {
  criado: "Animal cadastrado. Agora defina os sócios, se houver.",
  atualizado: "Animal atualizado.",
  socios: "Sócios salvos.",
  pesagem: "Pesagem registrada.",
  movimentacao: "Movimentação registrada.",
  lancamento: "Lançamento registrado e rateado entre os sócios.",
  lancamento_excluido: "Lançamento excluído.",
  status: "Situação do animal atualizada.",
};

export default async function FichaAnimalPage({ params, searchParams }: { params: { id: string }; searchParams: Busca }) {
  const { haras } = await exigirHaras();
  const supabase = createClient();
  const [a, clientes, categorias] = await Promise.all([obterAnimal(supabase, params.id), listarClientesHaras(supabase, haras.id), listarCategoriasHaras(supabase, haras.id)]);
  if (!a) notFound();

  const hoje = hojeISO();
  const receitas = a.lancamentos.filter((l) => l.type === "income").reduce((s, l) => s + l.amount, 0);
  const despesas = a.lancamentos.filter((l) => l.type === "expense").reduce((s, l) => s + l.amount, 0);
  const ultimoPeso = a.pesagens[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{a.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[a.animal_type, a.sex ? SEXO_ANIMAL[a.sex] : null, a.registration_code ? `registro ${a.registration_code}` : null].filter(Boolean).join(" · ") || "Sem detalhes"}
            {a.birth_date ? ` · nascido em ${formatarData(a.birth_date)}` : ""} · entrada em {formatarData(a.entry_date)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={a.status === "active" ? "sucesso" : "secondary"}>{STATUS_ANIMAL[a.status]}</Badge>
          <Button asChild variant="outline" size="sm"><Link href={`/haras/animais/${a.id}/editar`}>Editar</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/haras/animais">Voltar</Link></Button>
        </div>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <section className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle>Proprietário</CardTitle></CardHeader>
          <CardContent className="text-base font-semibold">{a.proprietario}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle>Localização</CardTitle></CardHeader>
          <CardContent className="text-base font-semibold">{a.location_note ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Último peso</CardTitle>
            <CardDescription>{ultimoPeso ? formatarData(ultimoPeso.weighed_at) : "Sem pesagem"}</CardDescription>
          </CardHeader>
          <CardContent className="text-base font-semibold">{ultimoPeso ? `${ultimoPeso.weight_kg.toLocaleString("pt-BR")} kg` : "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Resultado acumulado</CardTitle>
            <CardDescription>Receitas {formatarMoeda(receitas)} · despesas {formatarMoeda(despesas)}</CardDescription>
          </CardHeader>
          <CardContent className={`text-base font-semibold ${receitas - despesas < 0 ? "text-red-700" : "text-emerald-700"}`}>{formatarMoeda(receitas - despesas)}</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Sócios</CardTitle>
          <CardDescription>Participações em porcentagem. A soma precisa dar 100%. Sem sócios, o proprietário fica com tudo.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioSocios clientes={clientes} atual={a.socios.map((s) => ({ client_id: s.client_id, ownership_percentage: s.ownership_percentage }))} action={salvarSocios.bind(null, a.id)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos do animal</CardTitle>
          <CardDescription>Custos e receitas deste animal, rateados entre os sócios. Não mexem no caixa: são o controle por animal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormularioLancamentoAnimal hoje={hoje} categorias={categorias} action={registrarLancamentoAnimal.bind(null, a.id)} />
          {a.lancamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Rateio</TableHead>
                  <TableHead className="w-[1%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.lancamentos.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap">{formatarData(l.date)}</TableCell>
                    <TableCell className="font-medium">{l.description}</TableCell>
                    <TableCell className="text-muted-foreground">{l.categoria ?? "—"}</TableCell>
                    <TableCell className={`whitespace-nowrap text-right font-medium ${l.type === "income" ? "text-emerald-700" : "text-red-700"}`}>
                      {l.type === "income" ? "+" : "-"} {formatarMoeda(l.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {l.partes.map((p) => (
                          <div key={p.id} className="flex flex-wrap items-center gap-2 text-xs">
                            <span>{p.nome}</span>
                            <span className="text-muted-foreground">{p.ownership_percentage.toLocaleString("pt-BR")}% · {formatarMoeda(p.share_amount)}</span>
                            <Badge variant={p.status === "settled" ? "sucesso" : p.status === "waived" ? "secondary" : "alerta"}>{STATUS_PARTE[p.status]}</Badge>
                            {p.status === "pending" ? (
                              <form action={definirStatusParte} className="inline">
                                <input type="hidden" name="share_id" value={p.id} />
                                <input type="hidden" name="animal_id" value={a.id} />
                                <input type="hidden" name="status" value="settled" />
                                <button type="submit" className="underline underline-offset-2">acertar</button>
                              </form>
                            ) : (
                              <form action={definirStatusParte} className="inline">
                                <input type="hidden" name="share_id" value={p.id} />
                                <input type="hidden" name="animal_id" value={a.id} />
                                <input type="hidden" name="status" value="pending" />
                                <button type="submit" className="text-muted-foreground underline underline-offset-2">reabrir</button>
                              </form>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <form action={excluirLancamentoAnimal}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="animal_id" value={a.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">Excluir</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pesagens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormularioPesagem hoje={hoje} action={registrarPesagem.bind(null, a.id)} />
            {a.pesagens.length > 0 ? (
              <ul className="divide-y text-sm">
                {a.pesagens.map((p) => (
                  <li key={p.id} className="flex justify-between py-1.5">
                    <span>{formatarData(p.weighed_at)}{p.notes ? <span className="text-muted-foreground"> · {p.notes}</span> : null}</span>
                    <span className="font-medium">{p.weight_kg.toLocaleString("pt-BR")} kg</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Movimentações de local</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormularioMovimentacaoAnimal hoje={hoje} localAtual={a.location_note ?? ""} action={registrarMovimentacaoAnimal.bind(null, a.id)} />
            {a.movimentacoes.length > 0 ? (
              <ul className="divide-y text-sm">
                {a.movimentacoes.map((m) => (
                  <li key={m.id} className="py-1.5">
                    <span className="text-muted-foreground">{formatarData(m.moved_at)}</span> · {m.from_location ? `${m.from_location} → ` : ""}
                    <span className="font-medium">{m.to_location}</span>
                    {m.reason ? <span className="text-muted-foreground"> · {m.reason}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {(Object.keys(STATUS_ANIMAL) as (keyof typeof STATUS_ANIMAL)[]).filter((s) => s !== a.status).map((s) => (
          <form key={s} action={alterarStatusAnimal}>
            <input type="hidden" name="id" value={a.id} />
            <input type="hidden" name="status" value={s} />
            <Button type="submit" variant="outline" size="sm">Marcar como {STATUS_ANIMAL[s].toLowerCase()}</Button>
          </form>
        ))}
        <BotaoExcluir action={excluirAnimalAction} id={a.id} voltar="/haras/animais" rotulo="Excluir animal" mensagem="Excluir este animal e todo o histórico (sócios, pesagens, lançamentos)? Use só para corrigir cadastro errado." />
      </div>
    </div>
  );
}

