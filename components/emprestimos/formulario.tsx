"use client";

// Novo emprestimo. Mostra a parcela estimada com a mesma formula do banco (tabela Price).
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/emprestimos/actions";
import { formatarMoeda, parseValorBR } from "@/lib/utils/formatacao";
import { valorParcela } from "@/lib/validacao/emprestimo";

type Props = {
  unidades: { id: string; nome: string }[];
  clientes: { id: string; business_unit_id: string; name: string }[];
  unidadeInicial: string;
  hoje: string;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
};

function Botao() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Cadastrar empréstimo"}
    </Button>
  );
}

export function FormularioEmprestimo({ unidades, clientes, unidadeInicial, hoje, action }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [unidade, setUnidade] = useState(unidadeInicial);
  const [principal, setPrincipal] = useState("");
  const [taxa, setTaxa] = useState("");
  const [meses, setMeses] = useState("12");

  const tomadores = useMemo(() => clientes.filter((c) => c.business_unit_id === unidade), [clientes, unidade]);

  const estimativa = useMemo(() => {
    const p = parseValorBR(principal) ?? 0;
    const t = (parseValorBR(taxa) ?? 0) / 100;
    const n = Number(meses) || 0;
    if (p <= 0 || n <= 0) return null;
    const parcela = valorParcela(p, t, n);
    return { parcela, total: parcela * n, juros: parcela * n - p };
  }, [principal, taxa, meses]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business_unit_id">Unidade</Label>
          <SelectNativo id="business_unit_id" name="business_unit_id" value={unidade} onChange={(e) => setUnidade(e.target.value)} required>
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_id">Tomador</Label>
          <SelectNativo id="client_id" name="client_id" required>
            <option value="">Selecione...</option>
            {tomadores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectNativo>
          {unidade && tomadores.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum cliente nessa unidade. <Link href="/clientes" className="underline">Cadastre primeiro</Link>.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Valor emprestado (R$)</Label>
          <Input id="principal" name="principal" inputMode="decimal" placeholder="0,00" value={principal} onChange={(e) => setPrincipal(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly_rate">Juros (% ao mês)</Label>
          <Input id="monthly_rate" name="monthly_rate" inputMode="decimal" placeholder="Ex.: 2,5" value={taxa} onChange={(e) => setTaxa(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="term_months">Parcelas (meses)</Label>
          <Input id="term_months" name="term_months" type="number" min={1} max={600} value={meses} onChange={(e) => setMeses(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Data do empréstimo</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={hoje} required />
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 text-sm">
        {estimativa ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">Parcela mensal</div>
              <div className="text-lg font-semibold">{formatarMoeda(estimativa.parcela)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total a receber</div>
              <div className="text-lg font-semibold">{formatarMoeda(estimativa.total)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Juros no período</div>
              <div className="text-lg font-semibold">{formatarMoeda(estimativa.juros)}</div>
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-3">
              Parcelas iguais (tabela Price), a primeira vencendo um mês após a data do empréstimo. As parcelas são geradas
              automaticamente e não podem ser alteradas depois; para corrigir, exclua e cadastre de novo.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">Informe valor e prazo para ver a parcela estimada.</p>
        )}
      </div>

      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}

      <div className="flex items-center gap-3">
        <Botao />
        <Button asChild variant="ghost">
          <Link href="/emprestimos">Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
