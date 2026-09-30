"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { contratoSchema, lerContrato, primeiroErro, quitacaoSchema, rotativoSchema } from "@/lib/validacao/contrato-bancario";

export type EstadoFormulario = { erro?: string };

const ROTA = "/contratos-bancarios";

function revalidar(id?: string) {
  revalidatePath(ROTA);
  if (id) revalidatePath(`${ROTA}/${id}`);
  revalidatePath("/contas-a-pagar");
  revalidatePath("/movimentacoes");
  revalidatePath("/contas-bancarias");
  revalidatePath("/dashboard");
}

function payloadContrato(d: ReturnType<typeof contratoSchema.parse>) {
  const rotativo = d.contract_type === "revolving";
  return {
    business_unit_id: d.business_unit_id,
    institution: d.institution,
    contract_number: d.contract_number,
    contract_type: d.contract_type,
    principal: d.principal,
    contract_date: d.contract_date,
    installments_count: rotativo ? null : d.installments_count,
    installment_amount: rotativo ? null : d.installment_amount,
    first_due_date: rotativo ? null : d.first_due_date,
    interest_rate_info: d.interest_rate_info,
    bank_account_id: d.bank_account_id,
    notes: d.notes,
  };
}

// create_bank_contract: cria o contrato, as parcelas em contas a pagar e, se houver conta
// bancaria, credita o principal como receita "Emprestimos recebidos".
export async function criarContrato(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("bank_contracts", "create");
  const parsed = contratoSchema.safeParse(lerContrato(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const { data: id, error } = await createClient().rpc("create_bank_contract", { _payload: payloadContrato(d) });
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar(String(id));
  redirect(`${ROTA}/${id}?ok=criado`);
}

// renegotiate_bank_contract: cancela as parcelas pendentes do antigo, marca-o como renegociado
// e cria o novo contrato ligado a ele (sem creditar principal de novo).
export async function renegociarContrato(fromId: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("bank_contracts", "edit");
  const parsed = contratoSchema.safeParse(lerContrato(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const { data: novoId, error } = await createClient().rpc("renegotiate_bank_contract", {
    _payload: { from_contract_id: fromId, new_contract: payloadContrato(d) },
  });
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar(fromId);
  redirect(`${ROTA}/${novoId}?ok=renegociado`);
}

// settle_bank_contract: registra a saida da quitacao, cancela as parcelas pendentes e fecha.
export async function quitarContrato(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirPermissao("bank_contracts", "edit");
  const parsed = quitacaoSchema.safeParse({
    settlement_amount: String(fd.get("settlement_amount") ?? ""),
    payment_date: String(fd.get("payment_date") ?? ""),
    bank_account_id: String(fd.get("bank_account_id") ?? ""),
    expense_category_id: String(fd.get("expense_category_id") ?? ""),
    notes: String(fd.get("notes") ?? ""),
  });
  if (!parsed.success) return { erro: primeiroErro(parsed) };

  const { error } = await createClient().rpc("settle_bank_contract", { _payload: { contract_id: id, ...parsed.data } });
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar(id);
  redirect(`${ROTA}/${id}?ok=quitado`);
}

// add_revolving_charge: lancamento avulso (juros, tarifa, uso do limite) num contrato rotativo.
export async function lancarRotativo(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirPermissao("bank_contracts", "edit");
  const parsed = rotativoSchema.safeParse({
    amount: String(fd.get("amount") ?? ""),
    description: String(fd.get("description") ?? ""),
    due_date: String(fd.get("due_date") ?? ""),
    expense_category_id: String(fd.get("expense_category_id") ?? ""),
  });
  if (!parsed.success) return { erro: primeiroErro(parsed) };

  const { error } = await createClient().rpc("add_revolving_charge", { _payload: { contract_id: id, ...parsed.data } });
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar(id);
  redirect(`${ROTA}/${id}?ok=lancado`);
}

// Excluir so funciona sem parcelas (FK RESTRICT em payables). O trigger apaga o credito do principal.
export async function excluirContrato(fd: FormData) {
  await exigirPermissao("bank_contracts", "delete");
  const id = String(fd.get("id") ?? "");
  const supabase = createClient();

  const { count } = await supabase.from("payables").select("id", { count: "exact", head: true }).eq("bank_contract_id", id);
  if ((count ?? 0) > 0) {
    redirect(comParametro(`${ROTA}/${id}`, "erro", "Contrato com parcelas não pode ser excluído. Use quitação ou renegociação."));
  }

  const { error } = await supabase.from("bank_contracts").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(`${ROTA}/${id}`, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(ROTA, "ok", "excluido"));
}
