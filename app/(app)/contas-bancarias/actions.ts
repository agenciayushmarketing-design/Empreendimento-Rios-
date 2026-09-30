"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { campos, contaBancariaSchema, primeiroErro } from "@/lib/validacao/cadastros";

export type EstadoFormulario = { erro?: string };

const CAMPOS = ["name", "type", "bank_name", "agency", "account_number", "initial_balance", "initial_balance_date", "color", "notes"];

function lerFormulario(fd: FormData) {
  return { ...campos(fd, CAMPOS), unidades: fd.getAll("unidades").map(String) };
}

function revalidar() {
  revalidatePath("/contas-bancarias");
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
}

export async function criarContaBancaria(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("bank_accounts", "create");
  const parsed = contaBancariaSchema.safeParse(lerFormulario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { unidades, ...dados } = parsed.data;
  if (unidades.some((u) => !ctx.unidades.some((p) => p.id === u))) return { erro: "Unidade inválida." };

  const supabase = createClient();
  const { data: conta, error } = await supabase
    .from("bank_accounts")
    .insert({ ...dados, created_by: ctx.userId })
    .select("id")
    .single();
  if (error || !conta) return { erro: traduzirErroBanco(error?.message ?? "sem retorno") };

  if (unidades.length > 0) {
    const { error: e2 } = await supabase
      .from("bank_account_units")
      .insert(unidades.map((u) => ({ bank_account_id: conta.id, business_unit_id: u })));
    if (e2) return { erro: `Conta criada, mas não foi possível vincular as unidades: ${traduzirErroBanco(e2.message)}` };
  }

  revalidar();
  redirect("/contas-bancarias?ok=criada");
}

export async function atualizarContaBancaria(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("bank_accounts", "edit");
  const parsed = contaBancariaSchema.safeParse(lerFormulario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { unidades, ...dados } = parsed.data;
  if (unidades.some((u) => !ctx.unidades.some((p) => p.id === u))) return { erro: "Unidade inválida." };

  const supabase = createClient();
  const { error } = await supabase.from("bank_accounts").update(dados).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };

  // Vinculos: apaga e recria (poucas linhas, sem historico).
  const { error: eDel } = await supabase.from("bank_account_units").delete().eq("bank_account_id", id);
  if (eDel) return { erro: traduzirErroBanco(eDel.message) };
  if (unidades.length > 0) {
    const { error: eIns } = await supabase
      .from("bank_account_units")
      .insert(unidades.map((u) => ({ bank_account_id: id, business_unit_id: u })));
    if (eIns) return { erro: traduzirErroBanco(eIns.message) };
  }

  revalidar();
  redirect("/contas-bancarias?ok=atualizada");
}

// Contas nao sao excluidas: lancamentos apontam para elas. Desativar tira da lista de escolha.
export async function alternarAtivaContaBancaria(fd: FormData) {
  await exigirPermissao("bank_accounts", "edit");
  const id = String(fd.get("id") ?? "");
  const ativa = String(fd.get("ativa") ?? "") === "true";
  const voltar = "/contas-bancarias";

  const { error } = await createClient().from("bank_accounts").update({ is_active: ativa }).eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", ativa ? "reativada" : "desativada"));
}
