import { FormularioFuncionario } from "@/components/funcionarios/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { criarFuncionario } from "../actions";

export default async function NovoFuncionarioPage() {
  const ctx = await exigirPermissao("employees", "create");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades)) ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo funcionário</h1>
        <p className="text-sm text-muted-foreground">Os valores padrão alimentam a folha mensal.</p>
      </div>
      <FormularioFuncionario
        unidades={ctx.unidades}
        action={criarFuncionario}
        textoBotao="Cadastrar"
        valores={{
          business_unit_id: unidadeId, full_name: "", role: "", document: "", admission_date: "",
          default_base_salary: "", default_transport: "", default_meal: "", default_inss: "", default_fgts: "", default_other: "", notes: "",
        }}
      />
    </div>
  );
}
