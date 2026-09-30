"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/clientes/actions";

type Props = {
  unidades: { id: string; nome: string }[];
  valores: { business_unit_id: string; name: string; email: string; phone: string };
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioCliente({ unidades, valores, action, textoBotao }: Props) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business_unit_id">Unidade</Label>
          <SelectNativo id="business_unit_id" name="business_unit_id" defaultValue={valores.business_unit_id} required>
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={valores.name} maxLength={120} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={valores.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" inputMode="tel" defaultValue={valores.phone} placeholder="(00) 00000-0000" />
        </div>
      </div>
      {estado.erro ? <p className="text-sm text-destructive">{estado.erro}</p> : null}
      <Botao texto={textoBotao} />
    </form>
  );
}
