"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { enviarComprovante, removerComprovante, validarComprovante } from "@/lib/services/comprovantes";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { lerFormulario, movimentacaoSchema, primeiroErro } from "@/lib/validacao/movimentacao";

export type EstadoFormulario = { erro?: string };

function revalidar() {
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
  revalidatePath("/contas-bancarias");
}

function lerArquivo(fd: FormData): File | null {
  const a = fd.get("comprovante");
  return a instanceof File && a.size > 0 ? a : null;
}

export async function criarMovimentacao(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("cash_flow", "create");

  const parsed = movimentacaoSchema.safeParse(lerFormulario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const dados = parsed.data;
  if (!ctx.unidades.some((u) => u.id === dados.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const arquivo = lerArquivo(fd);
  const erroArquivo = validarComprovante(arquivo);
  if (erroArquivo) return { erro: erroArquivo };

  const supabase = createClient();
  const { data: criada, error } = await supabase
    .from("transactions")
    .insert({ ...dados, created_by: ctx.userId })
    .select("id")
    .single();
  if (error || !criada) return { erro: traduzirErroBanco(error?.message ?? "sem retorno") };

  // O lancamento ja existe; se o comprovante falhar, avisa sem bloquear (evita duplicar no reenvio).
  if (arquivo) {
    const r = await enviarComprovante(supabase, dados.business_unit_id, criada.id, arquivo);
    if (r.caminho) await supabase.from("transactions").update({ attachment_url: r.caminho }).eq("id", criada.id);
    revalidar();
    if (r.erro) redirect(comParametro("/movimentacoes?ok=criada", "erro", `Comprovante não enviado: ${r.erro}`));
  }

  revalidar();
  redirect("/movimentacoes?ok=criada");
}

export async function atualizarMovimentacao(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("cash_flow", "edit");

  const parsed = movimentacaoSchema.safeParse(lerFormulario(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const dados = parsed.data;
  if (!ctx.unidades.some((u) => u.id === dados.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const arquivo = lerArquivo(fd);
  const erroArquivo = validarComprovante(arquivo);
  if (erroArquivo) return { erro: erroArquivo };
  const removerAtual = String(fd.get("remover_comprovante") ?? "") === "on";

  const supabase = createClient();
  const { data: atual } = await supabase.from("transactions").select("is_transfer, attachment_url").eq("id", id).maybeSingle();
  if (!atual) return { erro: "Movimentação não encontrada." };
  if (atual.is_transfer) return { erro: "Transferências entre contas não são editadas aqui." };

  const { error } = await supabase.from("transactions").update(dados).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };

  let aviso: string | undefined;
  if (arquivo) {
    const r = await enviarComprovante(supabase, dados.business_unit_id, id, arquivo);
    if (r.caminho) {
      await supabase.from("transactions").update({ attachment_url: r.caminho }).eq("id", id);
      await removerComprovante(supabase, atual.attachment_url);
    } else {
      aviso = `Comprovante não enviado: ${r.erro}`;
    }
  } else if (removerAtual && atual.attachment_url) {
    await supabase.from("transactions").update({ attachment_url: null }).eq("id", id);
    await removerComprovante(supabase, atual.attachment_url);
  }

  revalidar();
  if (aviso) redirect(comParametro("/movimentacoes?ok=atualizada", "erro", aviso));
  redirect("/movimentacoes?ok=atualizada");
}

export async function excluirMovimentacao(fd: FormData) {
  await exigirPermissao("cash_flow", "delete");
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? "/movimentacoes");

  const supabase = createClient();
  const { data: atual } = await supabase.from("transactions").select("is_transfer, attachment_url").eq("id", id).maybeSingle();
  if (!atual) redirect(comParametro(voltar, "erro", "Movimentação não encontrada."));
  if (atual.is_transfer) redirect(comParametro(voltar, "erro", "Transferências são estornadas em Contas Bancárias."));

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  await removerComprovante(supabase, atual.attachment_url);
  redirect(comParametro(voltar, "ok", "excluida"));
}

export async function alternarStatus(fd: FormData) {
  await exigirPermissao("cash_flow", "edit");
  const id = String(fd.get("id") ?? "");
  const novo = String(fd.get("status") ?? "") === "paid" ? "paid" : "pending";
  const voltar = String(fd.get("voltar") ?? "/movimentacoes");

  const { error } = await createClient().from("transactions").update({ status: novo }).eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(voltar);
}
