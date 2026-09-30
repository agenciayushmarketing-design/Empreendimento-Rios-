"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/haras/actions";
import { SEXO_ANIMAL } from "@/lib/haras-rotulos";

export type ValoresAnimal = {
  name: string;
  animal_type: string;
  sex: string;
  registration_code: string;
  birth_date: string;
  entry_date: string;
  primary_client_id: string;
  origin: string;
  location_note: string;
  emergency_phone: string;
  notes: string;
};

type Props = {
  clientes: { id: string; name: string }[];
  valores: ValoresAnimal;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  voltarPara: string;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioAnimal({ clientes, valores, action, textoBotao, voltarPara }: Props) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={valores.name} maxLength={120} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registration_code">Registro</Label>
          <Input id="registration_code" name="registration_code" defaultValue={valores.registration_code} maxLength={60} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="animal_type">Tipo / raça</Label>
          <Input id="animal_type" name="animal_type" defaultValue={valores.animal_type} maxLength={60} placeholder="Ex.: Mangalarga" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sex">Sexo</Label>
          <SelectNativo id="sex" name="sex" defaultValue={valores.sex}>
            <option value="">Não informado</option>
            {Object.entries(SEXO_ANIMAL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">Nascimento</Label>
          <Input id="birth_date" name="birth_date" type="date" defaultValue={valores.birth_date} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry_date">Entrada no haras</Label>
          <Input id="entry_date" name="entry_date" type="date" defaultValue={valores.entry_date} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primary_client_id">Proprietário principal</Label>
          <SelectNativo id="primary_client_id" name="primary_client_id" defaultValue={valores.primary_client_id} required>
            <option value="">Selecione...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectNativo>
          {clientes.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum cliente do haras. <Link href="/haras/clientes" className="underline">Cadastre primeiro</Link>.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Sócios com percentual são definidos depois, na ficha do animal.</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="origin">Origem</Label>
          <Input id="origin" name="origin" defaultValue={valores.origin} maxLength={120} placeholder="Ex.: Nascido no haras, comprado de..." />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location_note">Localização atual</Label>
          <Input id="location_note" name="location_note" defaultValue={valores.location_note} maxLength={200} placeholder="Ex.: Baia 3, Pasto norte" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergency_phone">Telefone de emergência</Label>
          <Input id="emergency_phone" name="emergency_phone" defaultValue={valores.emergency_phone} maxLength={40} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Input id="notes" name="notes" defaultValue={valores.notes} maxLength={1000} />
      </div>

      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}

      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
        <Button asChild variant="ghost">
          <Link href={voltarPara}>Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
