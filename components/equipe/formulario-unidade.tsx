"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/equipe/unidades/actions";
import { TIPOS_UNIDADE } from "@/lib/haras-rotulos";

type Tipo = keyof typeof TIPOS_UNIDADE;

type Props = {
  modo: "criar" | "editar";
  valores: { name: string; type: Tipo; color: string };
  tiposDisponiveis: Tipo[];
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={texto === "Criar unidade" ? "default" : "secondary"} disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioUnidade({ modo, valores, tiposDisponiveis, action }: Props) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[160px] flex-1 space-y-1">
        <Label htmlFor={`name-${valores.type}`}>Nome</Label>
        <Input id={`name-${valores.type}`} name="name" defaultValue={valores.name} maxLength={80} required />
      </div>
      {modo === "criar" ? (
        <div className="space-y-1">
          <Label htmlFor="type">Tipo</Label>
          <SelectNativo id="type" name="type" defaultValue={valores.type} className="w-[160px]">
            {tiposDisponiveis.map((t) => (
              <option key={t} value={t}>
                {TIPOS_UNIDADE[t]}
              </option>
            ))}
          </SelectNativo>
        </div>
      ) : null}
      <div className="space-y-1">
        <Label htmlFor={`color-${valores.type}`}>Cor</Label>
        <Input id={`color-${valores.type}`} name="color" type="color" defaultValue={valores.color} className="h-10 w-14 p-1" />
      </div>
      <Botao texto={modo === "criar" ? "Criar unidade" : "Salvar"} />
      {estado?.erro ? <p className="w-full text-sm text-destructive">{estado?.erro}</p> : null}
    </form>
  );
}
