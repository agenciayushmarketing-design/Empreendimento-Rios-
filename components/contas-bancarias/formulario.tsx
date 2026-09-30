"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/contas-bancarias/actions";
import { TIPOS_CONTA } from "@/lib/validacao/cadastros";

export type ValoresConta = {
  name: string;
  type: keyof typeof TIPOS_CONTA;
  bank_name: string;
  agency: string;
  account_number: string;
  initial_balance: string;
  initial_balance_date: string;
  color: string;
  notes: string;
  unidades: string[];
};

type Props = {
  unidades: { id: string; nome: string }[];
  valores: ValoresConta;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  editando?: boolean;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioContaBancaria({ unidades, valores, action, textoBotao, editando }: Props) {
  const [estado, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_200px_90px]">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da conta</Label>
          <Input id="name" name="name" defaultValue={valores.name} maxLength={80} placeholder="Ex.: Itaú principal" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <SelectNativo id="type" name="type" defaultValue={valores.type}>
            {Object.entries(TIPOS_CONTA).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <Input id="color" name="color" type="color" defaultValue={valores.color} className="h-10 p-1" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="bank_name">Banco</Label>
          <Input id="bank_name" name="bank_name" defaultValue={valores.bank_name} placeholder="Ex.: Itaú" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agency">Agência</Label>
          <Input id="agency" name="agency" defaultValue={valores.agency} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_number">Conta</Label>
          <Input id="account_number" name="account_number" defaultValue={valores.account_number} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="initial_balance">Saldo inicial (R$)</Label>
          <Input id="initial_balance" name="initial_balance" inputMode="decimal" defaultValue={valores.initial_balance} placeholder="0,00" />
          <p className="text-xs text-muted-foreground">Saldo que a conta tinha na data abaixo. Os lançamentos somam a partir daí.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="initial_balance_date">Data do saldo inicial</Label>
          <Input id="initial_balance_date" name="initial_balance_date" type="date" defaultValue={valores.initial_balance_date} required />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Unidades que usam esta conta</legend>
        <p className="text-xs text-muted-foreground">Sem nenhuma marcada, a conta fica disponível para todas as unidades.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {unidades.map((u) => (
            <label key={u.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input type="checkbox" name="unidades" value={u.id} defaultChecked={valores.unidades.includes(u.id)} className="h-4 w-4" />
              {u.nome}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Input id="notes" name="notes" defaultValue={valores.notes} maxLength={200} />
      </div>

      {estado.erro ? <p className="text-sm text-destructive">{estado.erro}</p> : null}

      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
        <Button asChild variant="ghost">
          <Link href="/contas-bancarias">{editando ? "Voltar" : "Cancelar"}</Link>
        </Button>
      </div>
    </form>
  );
}
