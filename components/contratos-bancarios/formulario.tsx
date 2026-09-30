"use client";

// Contrato bancario (criar ou renegociar). Contrato rotativo nao tem parcelas fixas.
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/contratos-bancarios/actions";
import { formatarMoeda, parseValorBR } from "@/lib/utils/formatacao";
import { TIPOS_CONTRATO } from "@/lib/validacao/contrato-bancario";

export type ValoresContrato = {
  business_unit_id: string;
  institution: string;
  contract_number: string;
  contract_type: keyof typeof TIPOS_CONTRATO;
  principal: string;
  contract_date: string;
  installments_count: string;
  installment_amount: string;
  first_due_date: string;
  interest_rate_info: string;
  bank_account_id: string;
  notes: string;
};

type Props = {
  unidades: { id: string; nome: string }[];
  contas: { id: string; nome: string; unidades: string[] }[];
  valores: ValoresContrato;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  modo: "criar" | "renegociar";
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioContrato({ unidades, contas, valores, action, textoBotao, modo }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [unidade, setUnidade] = useState(valores.business_unit_id);
  const [tipo, setTipo] = useState<keyof typeof TIPOS_CONTRATO>(valores.contract_type);
  const [qtd, setQtd] = useState(valores.installments_count);
  const [parcela, setParcela] = useState(valores.installment_amount);

  const rotativo = tipo === "revolving";
  const contasDaUnidade = useMemo(() => contas.filter((c) => c.unidades.length === 0 || c.unidades.includes(unidade)), [contas, unidade]);
  const totalParcelas = (Number(qtd) || 0) * (parseValorBR(parcela) ?? 0);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business_unit_id">Unidade</Label>
          <SelectNativo id="business_unit_id" name="business_unit_id" value={unidade} onChange={(e) => setUnidade(e.target.value)} disabled={modo === "renegociar"} required>
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </SelectNativo>
          {modo === "renegociar" ? <input type="hidden" name="business_unit_id" value={valores.business_unit_id} /> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract_type">Tipo</Label>
          <SelectNativo id="contract_type" name="contract_type" value={tipo} onChange={(e) => setTipo(e.target.value as keyof typeof TIPOS_CONTRATO)}>
            {Object.entries(TIPOS_CONTRATO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectNativo>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="institution">Banco / instituição</Label>
          <Input id="institution" name="institution" defaultValue={valores.institution} maxLength={120} placeholder="Ex.: Banco do Brasil" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract_number">Número do contrato</Label>
          <Input id="contract_number" name="contract_number" defaultValue={valores.contract_number} maxLength={60} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="principal">{rotativo ? "Limite (R$)" : "Valor contratado (R$)"}</Label>
          <Input id="principal" name="principal" inputMode="decimal" placeholder="0,00" defaultValue={valores.principal} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contract_date">Data do contrato</Label>
          <Input id="contract_date" name="contract_date" type="date" defaultValue={valores.contract_date} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interest_rate_info">Taxa (% a.m., informativo)</Label>
          <Input id="interest_rate_info" name="interest_rate_info" inputMode="decimal" placeholder="Ex.: 1,8" defaultValue={valores.interest_rate_info} />
        </div>
      </div>

      {!rotativo ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="installments_count">Parcelas</Label>
            <Input id="installments_count" name="installments_count" type="number" min={1} max={600} value={qtd} onChange={(e) => setQtd(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installment_amount">Valor da parcela (R$)</Label>
            <Input id="installment_amount" name="installment_amount" inputMode="decimal" placeholder="0,00" value={parcela} onChange={(e) => setParcela(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_due_date">Primeiro vencimento</Label>
            <Input id="first_due_date" name="first_due_date" type="date" defaultValue={valores.first_due_date} required />
          </div>
          {totalParcelas > 0 ? (
            <p className="text-xs text-muted-foreground sm:col-span-3">
              Total das parcelas: <strong>{formatarMoeda(totalParcelas)}</strong>. Elas entram em Contas a Pagar, uma por mês, na categoria
              &quot;Empréstimos - parcelas&quot;.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Contrato rotativo: os lançamentos (juros, tarifas, uso do limite) são adicionados depois, um a um.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bank_account_id">Conta que recebeu o dinheiro</Label>
          <SelectNativo id="bank_account_id" name="bank_account_id" defaultValue={valores.bank_account_id}>
            <option value="">Não registrar entrada</option>
            {contasDaUnidade.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </SelectNativo>
          {modo === "criar" ? (
            <p className="text-xs text-muted-foreground">Se escolher uma conta, o valor contratado entra como receita &quot;Empréstimos recebidos&quot; nessa conta (exceto consórcio).</p>
          ) : (
            <p className="text-xs text-muted-foreground">Na renegociação o dinheiro não entra de novo.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Input id="notes" name="notes" defaultValue={valores.notes} maxLength={500} />
        </div>
      </div>

      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}

      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
        <Button asChild variant="ghost">
          <Link href="/contratos-bancarios">Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
