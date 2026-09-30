"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { lerFormulario, movimentacaoSchema, primeiroErro } from "@/lib/validacao/movimentacao";

export type EstadoFormulario = { erro?: string };

// Mensagens do Postgres/RLS em linguagem de gente.
function traduzirErro(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("row-level security") || m.includes("permission denied") || m.includes("42501")) {
    return "Sem permissão para essa operação nessa unidade.";
  }
  if (m.includes("fechado")) return mensagem; // enforce_period_close ja fala portugues
  return `Não foi possível salvar: ${mensagem}`;
}

function revalidar() {
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
}

export async function criarMovimentacao(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("cash_flow", "create");

  const parsed = movimentacaoSchema.safeParse(lerFormulario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const dados = parsed.data;

  if (!ctx.unidades.some((u) => u.id === dados.business_unit_id)) {
    return { erro: "Você não tem acesso a essa unidade." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("transactions").insert({ ...dados, created_by: ctx.userId });
  if (error) return { erro: traduzirErro(error.message) };

  revalidar();
  redirect("/movimentacoes?ok=criada");
}

export async function atualizarMovimentacao(
  id: string,
  _prev: EstadoFormulario,
  fd: FormData
): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("cash_flow", "edit");

  const parsed = movimentacaoSchema.safeParse(lerFormulario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const dados = parsed.data;

  if (!ctx.unidades.some((u) => u.id === dados.business_unit_id)) {
    return { erro: "Você não tem acesso a essa unidade." };
  }

  const supabase = createClient();
  const { data: atual } = await supabase.from("transactions").select("is_transfer").eq("id", id).maybeSingle();
  if (!atual) return { erro: "Movimentação não encontrada." };
  if (atual.is_transfer) return { erro: "Transferências entre contas não são editadas aqui." };

  const { error } = await supabase.from("transactions").update(dados).eq("id", id);
  if (error) return { erro: traduzirErro(error.message) };

  revalidar();
  redirect("/movimentacoes?ok=atualizada");
}

export async function excluirMovimentacao(fd: FormData) {
  await exigirPermissao("cash_flow", "delete");
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? "/movimentacoes");

  const supabase = createClient();
  const { data: atual } = await supabase.from("transactions").select("is_transfer").eq("id", id).maybeSingle();
  if (!atual) redirect(`${voltar}${voltar.includes("?") ? "&" : "?"}erro=${encodeURIComponent("Movimentação não encontrada.")}`);
  if (atual.is_transfer) {
    redirect(`${voltar}${voltar.includes("?") ? "&" : "?"}erro=${encodeURIComponent("Transferências são estornadas em Contas Bancárias.")}`);
  }

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  revalidar();
  if (error) {
    redirect(`${voltar}${voltar.includes("?") ? "&" : "?"}erro=${encodeURIComponent(traduzirErro(error.message))}`);
  }
  redirect(`${voltar}${voltar.includes("?") ? "&" : "?"}ok=excluida`);
}

export async function alternarStatus(fd: FormData) {
  await exigirPermissao("cash_flow", "edit");
  const id = String(fd.get("id") ?? "");
  const novo = String(fd.get("status") ?? "") === "paid" ? "paid" : "pending";
  const voltar = String(fd.get("voltar") ?? "/movimentacoes");

  const supabase = createClient();
  const { error } = await supabase.from("transactions").update({ status: novo }).eq("id", id);
  revalidar();
  if (error) {
    redirect(`${voltar}${voltar.includes("?") ? "&" : "?"}erro=${encodeURIComponent(traduzirErro(error.message))}`);
  }
  redirect(voltar);
}
