"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { categoriaFolha } from "@/lib/services/funcionarios";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { folhaSchema, funcionarioSchema, lerFuncionario, primeiroErro } from "@/lib/validacao/funcionario";

export type EstadoFormulario = { erro?: string };

function revalidar() {
  revalidatePath("/funcionarios");
  revalidatePath("/funcionarios/folha");
  revalidatePath("/contas-a-pagar");
  revalidatePath("/dashboard");
}

export async function criarFuncionario(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("employees", "create");
  const parsed = funcionarioSchema.safeParse(lerFuncionario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const { error } = await createClient().from("employees").insert({ ...d, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/funcionarios?ok=criado");
}

export async function atualizarFuncionario(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("employees", "edit");
  const parsed = funcionarioSchema.safeParse(lerFuncionario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const { error } = await createClient().from("employees").update(d).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/funcionarios?ok=atualizado");
}

// Arquivar em vez de excluir: as contas de folha antigas continuam apontando para a pessoa.
export async function alternarAtivoFuncionario(fd: FormData) {
  await exigirPermissao("employees", "edit");
  const id = String(fd.get("id") ?? "");
  const ativo = String(fd.get("ativo") ?? "") === "true";
  const voltar = String(fd.get("voltar") ?? "/funcionarios");

  const { error } = await createClient().from("employees").update({ is_active: ativo }).eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", ativo ? "reativado" : "arquivado"));
}

// generate_monthly_payroll: uma conta a pagar por funcionario ativo (ou pelos marcados), com o
// detalhamento de proventos e descontos, na categoria de folha da unidade.
export async function gerarFolha(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("payables", "create");
  const parsed = folhaSchema.safeParse({
    business_unit_id: String(fd.get("business_unit_id") ?? ""),
    periodo: String(fd.get("periodo") ?? ""),
    due_date: String(fd.get("due_date") ?? ""),
    employee_ids: fd.getAll("employee_ids").map(String),
  });
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const supabase = createClient();
  const categoria = await categoriaFolha(supabase, d.business_unit_id);
  if (!categoria) return { erro: "A unidade não tem categoria de folha de pagamento. Crie uma em Categorias marcando-a como folha." };

  const { data, error } = await supabase.rpc("generate_monthly_payroll", {
    _unit_id: d.business_unit_id,
    _period: `${d.periodo}-01`,
    _due_date: d.due_date,
    _category_id: categoria,
    _employee_ids: (d.employee_ids.length > 0 ? d.employee_ids : null) as unknown as string[],
  });
  if (error) return { erro: traduzirErroBanco(error.message) };

  const r = (data ?? {}) as { created?: number; skipped?: number; errors?: unknown[] };
  revalidar();
  const resumo = `criadas=${r.created ?? 0}&puladas=${r.skipped ?? 0}&erros=${Array.isArray(r.errors) ? r.errors.length : 0}`;
  redirect(`/funcionarios/folha?unidade=${d.business_unit_id}&periodo=${d.periodo}&ok=gerada&${resumo}`);
}

// Desfazer lote: a funcao rollback_payroll_batch do banco esta quebrada (compara com um status
// "partial" que nao existe no enum). A migration 20260930140000 corrige; ate la, mesma regra aqui:
// recusa se alguma conta do lote foi paga, senao apaga as pendentes.
export async function desfazerLoteFolha(fd: FormData) {
  await exigirPermissao("payables", "delete");
  const batchId = String(fd.get("batch_id") ?? "");
  const voltar = String(fd.get("voltar") ?? "/funcionarios/folha");
  const supabase = createClient();

  const { data: contas, error: eSel } = await supabase.from("payables").select("id, status").eq("payroll_batch_id", batchId);
  if (eSel) redirect(comParametro(voltar, "erro", traduzirErroBanco(eSel.message)));
  if (!contas || contas.length === 0) redirect(comParametro(voltar, "erro", "Lote não encontrado."));
  const pagas = contas.filter((c) => c.status === "paid").length;
  if (pagas > 0) redirect(comParametro(voltar, "erro", `Não é possível desfazer: ${pagas} conta(s) do lote já foram pagas.`));

  const { error } = await supabase.from("payables").delete().eq("payroll_batch_id", batchId).eq("status", "pending");
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "desfeito"));
}
