"use client";

// Formularios simples do haras: cliente (proprietario/socio) e categoria de lancamento.
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/haras/actions";

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export type ValoresClienteHaras = {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  is_owner_account: boolean;
  notes: string;
};

export function FormularioClienteHaras({
  valores,
  action,
  textoBotao,
  compacto,
}: {
  valores: ValoresClienteHaras;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  compacto?: boolean;
}) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <div className={compacto ? "grid gap-3 sm:grid-cols-4" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-1">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={valores.name} maxLength={120} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="document">CPF / CNPJ</Label>
          <Input id="document" name="document" defaultValue={valores.document} maxLength={30} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={valores.phone} maxLength={40} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={valores.email} />
        </div>
        {!compacto ? (
          <>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" name="address" defaultValue={valores.address} maxLength={300} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" name="notes" defaultValue={valores.notes} maxLength={500} />
            </div>
          </>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_owner_account" defaultChecked={valores.is_owner_account} className="h-4 w-4" />
        É a conta da própria dona (o rateio dela não gera cobrança)
      </label>
      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}
      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
        {!compacto ? (
          <Button asChild variant="ghost">
            <Link href="/haras/clientes">Voltar</Link>
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function FormularioCategoriaHaras({ action }: { action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario> }) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="grid items-end gap-3 sm:grid-cols-[1fr_180px_auto]">
      <div className="space-y-1">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" maxLength={80} placeholder="Ex.: Ração, Veterinário, Cobertura" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="type">Tipo</Label>
        <SelectNativo id="type" name="type" defaultValue="expense">
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </SelectNativo>
      </div>
      <Botao texto="Adicionar" />
      {estado?.erro ? <p className="text-sm text-destructive sm:col-span-3">{estado?.erro}</p> : null}
    </form>
  );
}
