import { FormularioEmprestimo } from "@/components/emprestimos/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { hojeISO } from "@/lib/utils/formatacao";
import { criarEmprestimo } from "../actions";

export default async function NovoEmprestimoPage() {
  const ctx = await exigirPermissao("loans", "create");
  const { data: clientes } = await createClient().from("clients").select("id, business_unit_id, name").order("name");
  const unidadeInicial = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades)) ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo empréstimo</h1>
        <p className="text-sm text-muted-foreground">As parcelas são calculadas e criadas automaticamente.</p>
      </div>
      <FormularioEmprestimo unidades={ctx.unidades} clientes={clientes ?? []} unidadeInicial={unidadeInicial} hoje={hojeISO()} action={criarEmprestimo} />
    </div>
  );
}
