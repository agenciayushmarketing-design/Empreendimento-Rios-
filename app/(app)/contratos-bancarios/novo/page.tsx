import { FormularioContrato } from "@/components/contratos-bancarios/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { hojeISO } from "@/lib/utils/formatacao";
import { criarContrato } from "../actions";

export default async function NovoContratoPage() {
  const ctx = await exigirPermissao("bank_contracts", "create");
  const opcoes = await opcoesDoFormulario(createClient());
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades)) ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : "");
  const hoje = hojeISO();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo contrato bancário</h1>
        <p className="text-sm text-muted-foreground">As parcelas entram automaticamente em Contas a Pagar.</p>
      </div>
      <FormularioContrato
        unidades={ctx.unidades}
        contas={opcoes.contas}
        action={criarContrato}
        textoBotao="Cadastrar contrato"
        modo="criar"
        valores={{
          business_unit_id: unidadeId,
          institution: "",
          contract_number: "",
          contract_type: "loan",
          principal: "",
          contract_date: hoje,
          installments_count: "12",
          installment_amount: "",
          first_due_date: "",
          interest_rate_info: "",
          bank_account_id: "",
          notes: "",
        }}
      />
    </div>
  );
}
