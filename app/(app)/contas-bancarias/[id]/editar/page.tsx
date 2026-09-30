import { notFound } from "next/navigation";

import { FormularioContaBancaria } from "@/components/contas-bancarias/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterContaBancaria } from "@/lib/services/cadastros";
import { createClient } from "@/lib/supabase/server";
import { valorParaCampo } from "@/lib/utils/formatacao";
import { atualizarContaBancaria } from "../../actions";

export default async function EditarContaBancariaPage({ params }: { params: { id: string } }) {
  const ctx = await exigirPermissao("bank_accounts", "edit");
  const conta = await obterContaBancaria(createClient(), params.id);
  if (!conta) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar conta bancária</h1>
        <p className="text-sm text-muted-foreground">{conta.name}</p>
      </div>
      <FormularioContaBancaria
        unidades={ctx.unidades}
        action={atualizarContaBancaria.bind(null, conta.id)}
        textoBotao="Salvar alterações"
        editando
        valores={{
          name: conta.name,
          type: conta.type,
          bank_name: conta.bank_name ?? "",
          agency: conta.agency ?? "",
          account_number: conta.account_number ?? "",
          initial_balance: valorParaCampo(conta.initial_balance),
          initial_balance_date: conta.initial_balance_date,
          color: conta.color ?? "#1E3A5F",
          notes: conta.notes ?? "",
          unidades: conta.unidades,
        }}
      />
    </div>
  );
}
