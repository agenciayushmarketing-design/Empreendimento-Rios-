import { notFound, redirect } from "next/navigation";

import { FormularioRotativo } from "@/components/contratos-bancarios/formularios-acoes";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterContrato } from "@/lib/services/contratos-bancarios";
import { opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { hojeISO } from "@/lib/utils/formatacao";
import { lancarRotativo } from "../../actions";

export default async function LancarRotativoPage({ params }: { params: { id: string } }) {
  await exigirPermissao("bank_contracts", "edit");
  const supabase = createClient();
  const [c, opcoes] = await Promise.all([obterContrato(supabase, params.id), opcoesDoFormulario(supabase)]);
  if (!c) notFound();
  if (c.status !== "active" || c.contract_type !== "revolving") {
    redirect(`/contratos-bancarios/${c.id}?erro=${encodeURIComponent("Só contratos rotativos ativos aceitam lançamentos.")}`);
  }
  const categorias = opcoes.categorias
    .filter((x) => x.business_unit_id === c.business_unit_id && x.type === "expense")
    .map((x) => ({ id: x.id, nome: x.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Lançar · {c.institution} #{c.contract_number}
        </h1>
        <p className="text-sm text-muted-foreground">Juros, tarifas ou uso do limite do rotativo.</p>
      </div>
      <FormularioRotativo contratoId={c.id} categorias={categorias} hoje={hojeISO()} action={lancarRotativo.bind(null, c.id)} />
    </div>
  );
}
