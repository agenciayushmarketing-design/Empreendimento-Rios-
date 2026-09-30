import { notFound } from "next/navigation";

import { FormularioMovimentacao } from "@/components/movimentacoes/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterMovimentacao, opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { valorParaCampo } from "@/lib/utils/formatacao";
import { atualizarMovimentacao } from "../../actions";

export default async function EditarMovimentacaoPage({ params }: { params: { id: string } }) {
  const ctx = await exigirPermissao("cash_flow", "edit");
  const supabase = createClient();
  const [mov, opcoes] = await Promise.all([obterMovimentacao(supabase, params.id), opcoesDoFormulario(supabase)]);
  if (!mov) notFound();

  let bloqueada: string | undefined;
  if (mov.is_transfer) bloqueada = "Transferências entre contas não são editadas aqui. Use Contas Bancárias para estornar.";
  else if (mov.closed_at) bloqueada = "Esta movimentação está em período fechado. Reabra o período antes de alterar.";

  const action = atualizarMovimentacao.bind(null, mov.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar movimentação</h1>
        <p className="text-sm text-muted-foreground">{mov.description}</p>
      </div>
      <FormularioMovimentacao
        unidades={ctx.unidades}
        opcoes={opcoes}
        action={action}
        textoBotao="Salvar alterações"
        bloqueada={bloqueada}
        valores={{
          business_unit_id: mov.business_unit_id,
          date: mov.date,
          type: mov.type,
          description: mov.description,
          amount: valorParaCampo(mov.amount),
          status: mov.status === "paid" ? "paid" : "pending",
          category_id: mov.category_id ?? "",
          client_id: mov.client_id ?? "",
          bank_account_id: mov.bank_account_id ?? "",
        }}
      />
    </div>
  );
}
