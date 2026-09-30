"use client";

// Botao de exclusao generico: pede confirmacao e envia id + rota de retorno para a server action.
import { Button } from "@/components/ui/button";

type Props = {
  action: (fd: FormData) => Promise<void>;
  id: string;
  voltar: string;
  mensagem?: string;
  rotulo?: string;
};

export function BotaoExcluir({ action, id, voltar, mensagem, rotulo = "Excluir" }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(mensagem ?? "Excluir este registro? Essa ação não pode ser desfeita.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="voltar" value={voltar} />
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        {rotulo}
      </Button>
    </form>
  );
}
