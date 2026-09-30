"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/reservas/actions";

export type ValoresReserva = {
  business_unit_id: string;
  client_id: string;
  title: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  status: "pending" | "confirmed";
  notes: string;
};

type Props = {
  unidades: { id: string; nome: string }[];
  clientes: { id: string; business_unit_id: string; name: string }[];
  valores: ValoresReserva;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  jaConfirmada?: boolean;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioReserva({ unidades, clientes, valores, action, textoBotao, jaConfirmada }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [unidade, setUnidade] = useState(valores.business_unit_id);
  const pessoas = useMemo(() => clientes.filter((c) => c.business_unit_id === unidade), [clientes, unidade]);

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
          <Label htmlFor="client_id">Cliente</Label>
          <SelectNativo id="client_id" name="client_id" defaultValue={valores.client_id}>
            <option value="">Nenhum</option>
            {pessoas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectNativo>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={valores.title} maxLength={120} placeholder="Ex.: Casamento Ana e João" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Início</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={valores.start_date} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Término</Label>
          <Input id="end_date" name="end_date" type="date" defaultValue={valores.end_date} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_amount">Valor (R$)</Label>
          <Input id="total_amount" name="total_amount" inputMode="decimal" placeholder="0,00" defaultValue={valores.total_amount} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Situação</Label>
          <SelectNativo id="status" name="status" defaultValue={valores.status} disabled={jaConfirmada}>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmada</option>
          </SelectNativo>
          {jaConfirmada ? <input type="hidden" name="status" value="confirmed" /> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Input id="notes" name="notes" defaultValue={valores.notes} maxLength={500} />
      </div>

      <p className="text-xs text-muted-foreground">
        Ao confirmar, o sistema cria uma conta a receber com o valor da reserva, vencendo no término. O sistema não deixa duas
        reservas pendentes ou confirmadas na mesma unidade com datas que se cruzam.
      </p>

      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}

      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
        <Button asChild variant="ghost">
          <Link href="/reservas">Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
