"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/emprestimos/actions";

type Props = {
  loanId: string;
  categorias: { id: string; name: string }[];
  contas: { id: string; nome: string }[];
  hoje: string;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
};

function Botao() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Confirmar recebimento"}
    </Button>
  );
}

export function FormularioRecebimento({ loanId, categorias, contas, hoje, action }: Props) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="payment_date">Data do recebimento</Label>
          <Input id="payment_date" name="payment_date" type="date" defaultValue={hoje} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category_id">Categoria</Label>
          <SelectNativo id="category_id" name="category_id" defaultValue="">
            <option value="">Sem categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_account_id">Conta bancária</Label>
          <SelectNativo id="bank_account_id" name="bank_account_id" defaultValue="">
            <option value="">Nenhuma</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">O recebimento gera uma movimentação de entrada com o valor da parcela.</p>
      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}
      <div className="flex items-center gap-3">
        <Botao />
        <Button asChild variant="ghost">
          <Link href={`/emprestimos/${loanId}`}>Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
