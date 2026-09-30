"use client";

import { Button } from "@/components/ui/button";
import { excluirMovimentacao } from "@/app/(app)/movimentacoes/actions";

export function BotaoExcluir({ id, voltar }: { id: string; voltar: string }) {
  return (
    <form
      action={excluirMovimentacao}
      onSubmit={(e) => {
        if (!confirm("Excluir esta movimentação? Essa ação não pode ser desfeita.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="voltar" value={voltar} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        Excluir
      </Button>
    </form>
  );
}
