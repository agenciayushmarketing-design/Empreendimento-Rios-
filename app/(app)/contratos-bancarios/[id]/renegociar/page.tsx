import { notFound, redirect } from "next/navigation";

import { FormularioContrato } from "@/components/contratos-bancarios/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterContrato } from "@/lib/services/contratos-bancarios";
import { opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { formatarMoeda, hojeISO, valorParaCampo } from "@/lib/utils/formatacao";
import { renegociarContrato } from "../../actions";

export default async function RenegociarContratoPage({ params }: { params: { id: string } }) {
  const ctx = await exigirPermissao("bank_contracts", "edit");
  const supabase = createClient();
  const [c, opcoes] = await Promise.all([obterContrato(supabase, params.id), opcoesDoFormulario(supabase)]);
  if (!c) notFound();
  if (c.status !== "active") {
    redirect(`/contratos-bancarios/${c.id}?erro=${encodeURIComponent("Só contratos ativos podem ser renegociados.")}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Renegociar · {c.institution} #{c.contract_number}
        </h1>
        <p className="text-sm text-muted-foreground">
          Saldo pendente hoje: {formatarMoeda(c.progresso.valorPendente)}. As parcelas pendentes do contrato atual serão canceladas e o
          novo contrato entra no lugar, com as novas condições.
        </p>
      </div>
      <FormularioContrato
        unidades={ctx.unidades}
        contas={opcoes.contas}
        action={renegociarContrato.bind(null, c.id)}
        textoBotao="Confirmar renegociação"
        modo="renegociar"
        valores={{
          business_unit_id: c.business_unit_id,
          institution: c.institution,
          contract_number: `${c.contract_number}-R`,
          contract_type: c.contract_type,
          principal: valorParaCampo(c.progresso.valorPendente),
          contract_date: hojeISO(),
          installments_count: String(c.installments_count ?? 12),
          installment_amount: "",
          first_due_date: "",
          interest_rate_info: c.interest_rate_info === null ? "" : valorParaCampo(c.interest_rate_info),
          bank_account_id: "",
          notes: "",
        }}
      />
    </div>
  );
}
