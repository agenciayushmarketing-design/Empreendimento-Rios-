"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/categorias/actions";

type Props = {
  unidades: { id: string; nome: string }[];
  valores: { business_unit_id: string; name: string; type: "income" | "expense" };
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  somenteNome?: boolean;
  compacto?: boolean;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioCategoria({ unidades, valores, action, textoBotao, somenteNome, compacto }: Props) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className={compacto ? "grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]" : "max-w-xl space-y-4"}>
      <div className="space-y-2">
        <Label htmlFor="business_unit_id">Unidade</Label>
        <SelectNativo id="business_unit_id" name="business_unit_id" defaultValue={valores.business_unit_id} disabled={somenteNome} required>
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
        <SelectNativo id="type" name="type" defaultValue={valores.type} disabled={somenteNome}>
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </SelectNativo>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={valores.name} maxLength={80} placeholder="Ex.: Aluguel" required />
      </div>
      {somenteNome ? (
        <>
          <input type="hidden" name="business_unit_id" value={valores.business_unit_id} />
          <input type="hidden" name="type" value={valores.type} />
        </>
      ) : null}
      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
      </div>
      {estado.erro ? <p className="text-sm text-destructive sm:col-span-4">{estado.erro}</p> : null}
    </form>
  );
}
