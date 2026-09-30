import { FormularioMovimentacao } from "@/components/movimentacoes/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { hojeISO } from "@/lib/utils/formatacao";
import { criarMovimentacao } from "../actions";

export default async function NovaMovimentacaoPage() {
  const ctx = await exigirPermissao("cash_flow", "create");
  const opcoes = await opcoesDoFormulario(createClient());
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades)) ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova movimentação</h1>
        <p className="text-sm text-muted-foreground">Registre uma entrada ou saída de caixa.</p>
      </div>
      <FormularioMovimentacao
        unidades={ctx.unidades}
        opcoes={opcoes}
        action={criarMovimentacao}
        textoBotao="Registrar"
        valores={{
          business_unit_id: unidadeId,
          date: hojeISO(),
          type: "expense",
          description: "",
          amount: "",
          status: "paid",
          category_id: "",
          client_id: "",
          bank_account_id: "",
        }}
      />
    </div>
  );
}
