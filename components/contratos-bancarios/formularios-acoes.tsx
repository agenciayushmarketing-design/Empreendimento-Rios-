"use client";

// Quitacao antecipada e lancamento em contrato rotativo.
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/contratos-bancarios/actions";

type Opcao = { id: string; nome: string };

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioQuitacao({
  contratoId,
  categorias,
  contas,
  hoje,
  valorPendente,
  action,
}: {
  contratoId: string;
  categorias: Opcao[];
  contas: Opcao[];
  hoje: string;
  valorPendente: string;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
}) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settlement_amount">Valor pago na quitação (R$)</Label>
          <Input id="settlement_amount" name="settlement_amount" inputMode="decimal" defaultValue={valorPendente} required />
          <p className="text-xs text-muted-foreground">Normalmente menor que o saldo das parcelas, por causa do desconto de juros.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_date">Data do pagamento</Label>
          <Input id="payment_date" name="payment_date" type="date" defaultValue={hoje} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_account_id">Conta bancária</Label>
          <SelectNativo id="bank_account_id" name="bank_account_id" required>
            <option value="">Selecione...</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense_category_id">Categoria de despesa</Label>
          <SelectNativo id="expense_category_id" name="expense_category_id" required>
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Input id="notes" name="notes" maxLength={500} />
      </div>
      <p className="text-xs text-muted-foreground">
        A quitação registra a saída na conta escolhida, cancela as parcelas ainda pendentes e fecha o contrato. Não dá para desfazer pela tela.
      </p>
      {estado.erro ? <p className="text-sm text-destructive">{estado.erro}</p> : null}
      <div className="flex items-center gap-3">
        <Botao texto="Confirmar quitação" />
        <Button asChild variant="ghost">
          <Link href={`/contratos-bancarios/${contratoId}`}>Voltar</Link>
        </Button>
      </div>
    </form>
  );
}

export function FormularioRotativo({
  contratoId,
  categorias,
  hoje,
  action,
}: {
  contratoId: string;
  categorias: Opcao[];
  hoje: string;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
}) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input id="amount" name="amount" inputMode="decimal" placeholder="0,00" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Vencimento</Label>
          <Input id="due_date" name="due_date" type="date" defaultValue={hoje} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" maxLength={200} placeholder="Ex.: Juros do cheque especial - setembro" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="expense_category_id">Categoria de despesa</Label>
          <SelectNativo id="expense_category_id" name="expense_category_id" required>
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">O lançamento entra em Contas a Pagar ligado a este contrato.</p>
      {estado.erro ? <p className="text-sm text-destructive">{estado.erro}</p> : null}
      <div className="flex items-center gap-3">
        <Botao texto="Lançar" />
        <Button asChild variant="ghost">
          <Link href={`/contratos-bancarios/${contratoId}`}>Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
