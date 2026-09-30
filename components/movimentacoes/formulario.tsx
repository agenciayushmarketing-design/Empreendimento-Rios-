"use client";

// Formulario de movimentacao (criar e editar). Unidade e tipo filtram categorias, clientes e
// contas no proprio cliente; a validacao de verdade acontece na server action e no banco.
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/movimentacoes/actions";
import type { OpcoesFormulario } from "@/lib/services/movimentacoes";

export type ValoresMovimentacao = {
  business_unit_id: string;
  date: string;
  type: "income" | "expense";
  description: string;
  amount: string;
  status: "paid" | "pending";
  category_id: string;
  client_id: string;
  bank_account_id: string;
};

type Props = {
  unidades: { id: string; nome: string }[];
  opcoes: OpcoesFormulario;
  valores: ValoresMovimentacao;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  bloqueada?: string; // motivo para o formulario estar somente leitura
  comprovanteAtual?: { url: string; nome: string } | null;
};

function BotaoSalvar({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioMovimentacao({ unidades, opcoes, valores, action, textoBotao, bloqueada, comprovanteAtual }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [unidade, setUnidade] = useState(valores.business_unit_id);
  const [tipo, setTipo] = useState<"income" | "expense">(valores.type);

  const categorias = useMemo(
    () => opcoes.categorias.filter((c) => c.business_unit_id === unidade && c.type === tipo),
    [opcoes.categorias, unidade, tipo]
  );
  const clientes = useMemo(() => opcoes.clientes.filter((c) => c.business_unit_id === unidade), [opcoes.clientes, unidade]);
  const contas = useMemo(
    () => opcoes.contas.filter((c) => c.unidades.length === 0 || c.unidades.includes(unidade)),
    [opcoes.contas, unidade]
  );

  const desabilitado = Boolean(bloqueada);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {bloqueada ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{bloqueada}</p>
      ) : null}

      <fieldset disabled={desabilitado} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business_unit_id">Unidade</Label>
            <SelectNativo
              id="business_unit_id"
              name="business_unit_id"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </SelectNativo>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <SelectNativo id="type" name="type" value={tipo} onChange={(e) => setTipo(e.target.value as "income" | "expense")}>
              <option value="income">Receita (entrada)</option>
              <option value="expense">Despesa (saída)</option>
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
            <Label htmlFor="date">Data</Label>
            <Input id="date" name="date" type="date" defaultValue={valores.date} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <SelectNativo id="status" name="status" defaultValue={valores.status}>
              <option value="paid">Pago / recebido</option>
              <option value="pending">Pendente</option>
            </SelectNativo>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente / fornecedor</Label>
            <SelectNativo id="client_id" name="client_id" defaultValue={valores.client_id}>
              <option value="">Nenhum</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectNativo>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_account_id">Conta bancária</Label>
            <SelectNativo id="bank_account_id" name="bank_account_id" defaultValue={valores.bank_account_id}>
              <option value="">Nenhuma</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </SelectNativo>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="comprovante">Comprovante (PDF ou foto, até 5 MB)</Label>
          <Input id="comprovante" name="comprovante" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="h-auto py-2" />
          {comprovanteAtual ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <a href={comprovanteAtual.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                Ver comprovante atual ({comprovanteAtual.nome})
              </a>
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" name="remover_comprovante" className="h-4 w-4" />
                Remover
              </label>
            </div>
          ) : null}
        </div>
      </fieldset>

      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}

      <div className="flex items-center gap-3">
        {!desabilitado ? <BotaoSalvar texto={textoBotao} /> : null}
        <Button asChild variant="ghost">
          <Link href="/movimentacoes">Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
