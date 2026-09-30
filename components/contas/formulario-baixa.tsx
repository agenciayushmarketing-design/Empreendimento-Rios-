"use client";

// Baixa (pagar / receber): data, categoria da movimentacao gerada e conta bancaria.
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/contas-actions";
import type { ConfigConta } from "@/lib/contas-config";

type Props = {
  cfg: ConfigConta;
  categorias: { id: string; name: string }[];
  contas: { id: string; nome: string }[];
  valores: { payment_date: string; category_id: string; bank_account_id: string };
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioBaixa({ cfg, categorias, contas, valores, action }: Props) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="payment_date">Data do {cfg.tipo === "pagar" ? "pagamento" : "recebimento"}</Label>
          <Input id="payment_date" name="payment_date" type="date" defaultValue={valores.payment_date} required />
        </div>
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
      <p className="text-xs text-muted-foreground">
        A baixa gera uma movimentação de caixa com esse valor. Para desfazer, use "Estornar" na lista.
      </p>
      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}
      <div className="flex items-center gap-3">
        <Botao texto={`Confirmar ${cfg.verboBaixa.toLowerCase()}`} />
        <Button asChild variant="ghost">
          <Link href={cfg.rota}>Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
