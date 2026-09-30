import { notFound } from "next/navigation";

import { FormularioFuncionario } from "@/components/funcionarios/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterFuncionario } from "@/lib/services/funcionarios";
import { createClient } from "@/lib/supabase/server";
import { valorParaCampo } from "@/lib/utils/formatacao";
import { atualizarFuncionario } from "../../actions";

export default async function EditarFuncionarioPage({ params }: { params: { id: string } }) {
  const ctx = await exigirPermissao("employees", "edit");
  const f = await obterFuncionario(createClient(), params.id);
  if (!f) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar funcionário</h1>
        <p className="text-sm text-muted-foreground">{f.full_name}</p>
      </div>
      <FormularioFuncionario
        unidades={ctx.unidades}
        action={atualizarFuncionario.bind(null, f.id)}
        textoBotao="Salvar alterações"
        valores={{
          business_unit_id: f.business_unit_id, full_name: f.full_name, role: f.role ?? "", document: f.document ?? "",
          admission_date: f.admission_date ?? "",
          default_base_salary: valorParaCampo(f.default_base_salary), default_transport: valorParaCampo(f.default_transport),
          default_meal: valorParaCampo(f.default_meal), default_inss: valorParaCampo(f.default_inss),
          default_fgts: valorParaCampo(f.default_fgts), default_other: valorParaCampo(f.default_other), notes: f.notes ?? "",
        }}
      />
    </div>
  );
}
