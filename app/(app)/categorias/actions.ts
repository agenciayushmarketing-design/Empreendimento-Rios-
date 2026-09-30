"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { campos, categoriaSchema, primeiroErro } from "@/lib/validacao/cadastros";

export type EstadoFormulario = { erro?: string };

const CAMPOS = ["business_unit_id", "name", "type"];

function revalidar() {
  revalidatePath("/categorias");
  revalidatePath("/movimentacoes");
}

export async function criarCategoria(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("categories", "create");
  const parsed = categoriaSchema.safeParse(campos(fd, CAMPOS));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  if (!ctx.unidades.some((u) => u.id === parsed.data.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const { error } = await createClient().from("categories").insert({ ...parsed.data, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/categorias?ok=criada");
}

export async function atualizarCategoria(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("categories", "edit");
  const parsed = categoriaSchema.safeParse(campos(fd, CAMPOS));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  if (!ctx.unidades.some((u) => u.id === parsed.data.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const supabase = createClient();
  const { data: atual } = await supabase.from("categories").select("is_payroll, business_unit_id, type").eq("id", id).maybeSingle();
  if (!atual) return { erro: "Categoria não encontrada." };
  // A categoria de folha e criada pelo banco por unidade; so o nome pode mudar.
  const dados = atual.is_payroll ? { name: parsed.data.name } : parsed.data;

  const { error } = await supabase.from("categories").update(dados).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/categorias?ok=atualizada");
}

export async function excluirCategoria(fd: FormData) {
  await exigirPermissao("categories", "delete");
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? "/categorias");
  const supabase = createClient();

  const { data: atual } = await supabase.from("categories").select("is_payroll").eq("id", id).maybeSingle();
  if (!atual) redirect(comParametro(voltar, "erro", "Categoria não encontrada."));
  if (atual.is_payroll) redirect(comParametro(voltar, "erro", "A categoria de folha de pagamento não pode ser excluída."));

  const { error } = await supabase.from("categories").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "excluida"));
}
