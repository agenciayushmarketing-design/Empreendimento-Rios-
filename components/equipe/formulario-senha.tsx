"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoFormulario } from "@/app/(app)/equipe/actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? "Salvando..." : "Definir senha provisória"}
    </Button>
  );
}

export function FormularioSenha({ action }: { action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario> }) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="flex max-w-md flex-wrap items-end gap-3">
      <div className="flex-1 space-y-2">
        <Label htmlFor="password">Nova senha provisória</Label>
        <Input id="password" name="password" type="text" autoComplete="off" minLength={8} required />
      </div>
      <Botao />
      {estado.erro ? <p className="w-full text-sm text-destructive">{estado.erro}</p> : null}
    </form>
  );
}
