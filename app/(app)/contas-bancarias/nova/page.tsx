import { FormularioContaBancaria } from "@/components/contas-bancarias/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { hojeISO } from "@/lib/utils/formatacao";
import { criarContaBancaria } from "../actions";

export default async function NovaContaBancariaPage() {
  const ctx = await exigirPermissao("bank_accounts", "create");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova conta bancária</h1>
        <p className="text-sm text-muted-foreground">Conta corrente, poupança, caixa físico ou cartão.</p>
      </div>
      <FormularioContaBancaria
        unidades={ctx.unidades}
        action={criarContaBancaria}
        textoBotao="Cadastrar"
        valores={{
          name: "",
          type: "checking",
          bank_name: "",
          agency: "",
          account_number: "",
          initial_balance: "",
          initial_balance_date: hojeISO(),
          color: "#1E3A5F",
          notes: "",
          unidades: [],
        }}
      />
    </div>
  );
}
