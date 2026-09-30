"use client";

// Formulario de conta a pagar / a receber. Unidade filtra categorias (pelo tipo da conta),
// pessoas e contas bancarias no cliente. Contas a pagar podem ser recorrentes (mensal).
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/contas-actions";
import type { ConfigConta } from "@/lib/contas-config";
import type { OpcoesFormulario } from "@/lib/services/movimentacoes";

export type ValoresConta = {
  business_unit_id: string;
  description: string;
  amount: string;
  due_date: string;
  category_id: string;
  pessoa_id: string;
  preferred_bank_account_id: string;
  notes: string;
};

type Props = {
  cfg: ConfigConta;
  unidades: { id: string; nome: string }[];
  opcoes: OpcoesFormulario;
  valores: ValoresConta;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  permitirRecorrencia?: boolean;
  bloqueada?: string;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioConta({ cfg, unidades, opcoes, valores, action, textoBotao, permitirRecorrencia, bloqueada }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [unidade, setUnidade] = useState(valores.business_unit_id);
  const [recorrente, setRecorrente] = useState(false);

  const categorias = useMemo(
    () => opcoes.categorias.filter((c) => c.business_unit_id === unidade && c.type === cfg.tipoCategoria),
    [opcoes.categorias, unidade, cfg.tipoCategoria]
  );
  const pessoas = useMemo(() => opcoes.clientes.filter((c) => c.business_unit_id === unidade), [opcoes.clientes, unidade]);
  const contas = useMemo(
    () => opcoes.contas.filter((c) => c.unidades.length === 0 || c.unidades.includes(unidade)),
    [opcoes.contas, unidade]
  );
  const desabilitado = Boolean(bloqueada);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {bloqueada ? <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{bloqueada}</p> : null}

      <fieldset disabled={desabilitado} className="space-y-5">
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
            <Label htmlFor="pessoa_id">{cfg.pessoaRotulo}</Label>
            <SelectNativo id="pessoa_id" name="pessoa_id" defaultValue={valores.pessoa_id}>
              <option value="">Nenhum</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectNativo>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" defaultValue={valores.description} maxLength={200} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input id="amount" name="amount" inputMode="decimal" placeholder="0,00" defaultValue={valores.amount} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">{recorrente ? "Primeiro vencimento" : "Vencimento"}</Label>
            <Input id="due_date" name="due_date" type="date" defaultValue={valores.due_date} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_id">Categoria</Label>
            <SelectNativo id="category_id" name="category_id" defaultValue={valores.category_id}>
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectNativo>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferred_bank_account_id">Conta bancária prevista</Label>
            <SelectNativo id="preferred_bank_account_id" name="preferred_bank_account_id" defaultValue={valores.preferred_bank_account_id}>
              <option value="">Definir na baixa</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </SelectNativo>
          </div>
          {cfg.temRecorrencia ? (
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" name="notes" defaultValue={valores.notes} maxLength={500} />
            </div>
          ) : null}
        </div>

        {permitirRecorrencia && cfg.temRecorrencia ? (
          <div className="space-y-3 rounded-md border p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="recorrente" className="h-4 w-4" checked={recorrente} onChange={(e) => setRecorrente(e.target.checked)} />
              Repetir todo mês
            </label>
            {recorrente ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="day_of_month">Dia do vencimento (1 a 28)</Label>
                  <Input id="day_of_month" name="day_of_month" type="number" min={1} max={28} defaultValue={Number(valores.due_date.slice(8, 10)) || 1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Termina em (opcional)</Label>
                  <Input id="end_date" name="end_date" type="date" />
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  O sistema cria a conta do mês automaticamente, todo dia, às 6h. A primeira já entra agora.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}

      <div className="flex items-center gap-3">
        {!desabilitado ? <Botao texto={textoBotao} /> : null}
        <Button asChild variant="ghost">
          <Link href={cfg.rota}>Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
