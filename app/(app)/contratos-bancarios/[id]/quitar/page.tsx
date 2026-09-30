import { notFound, redirect } from "next/navigation";

import { FormularioQuitacao } from "@/components/contratos-bancarios/formularios-acoes";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterContrato } from "@/lib/services/contratos-bancarios";
import { opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { formatarMoeda, hojeISO, valorParaCampo } from "@/lib/utils/formatacao";
import { quitarContrato } from "../../actions";

export default async function QuitarContratoPage({ params }: { params: { id: string } }) {
  await exigirPermissao("bank_contracts", "edit");
  const supabase = createClient();
  const [c, opcoes] = await Promise.all([obterContrato(supabase, params.id), opcoesDoFormulario(supabase)]);
  if (!c) notFound();
  if (c.status !== "active") {
    redirect(`/contratos-bancarios/${c.id}?erro=${encodeURIComponent("Só contratos ativos podem ser quitados.")}`);
  }

  const categorias = opcoes.categorias
    .filter((x) => x.business_unit_id === c.business_unit_id && x.type === "expense")
    .map((x) => ({ id: x.id, nome: x.name }));
  const contas = opcoes.contas
    .filter((x) => x.unidades.length === 0 || x.unidades.includes(c.business_unit_id))
    .map((x) => ({ id: x.id, nome: x.nome }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Quitar · {c.institution} #{c.contract_number}
        </h1>
        <p className="text-sm text-muted-foreground">Saldo das parcelas pendentes: {formatarMoeda(c.progresso.valorPendente)}.</p>
      </div>
      <FormularioQuitacao
        contratoId={c.id}
        categorias={categorias}
        contas={contas}
        hoje={hojeISO()}
        valorPendente={valorParaCampo(c.progresso.valorPendente)}
        action={quitarContrato.bind(null, c.id)}
      />
    </div>
  );
}
