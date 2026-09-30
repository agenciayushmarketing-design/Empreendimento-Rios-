"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { campos, clienteSchema, primeiroErro } from "@/lib/validacao/cadastros";

export type EstadoFormulario = { erro?: string };

const CAMPOS = ["business_unit_id", "name", "email", "phone"];

function revalidar() {
  revalidatePath("/clientes");
  revalidatePath("/movimentacoes");
}

export async function criarCliente(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("clients", "create");
  const parsed = clienteSchema.safeParse(campos(fd, CAMPOS));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  if (!ctx.unidades.some((u) => u.id === parsed.data.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const { error } = await createClient().from("clients").insert({ ...parsed.data, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/clientes?ok=criado");
}

export async function atualizarCliente(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("clients", "edit");
  const parsed = clienteSchema.safeParse(campos(fd, CAMPOS));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  if (!ctx.unidades.some((u) => u.id === parsed.data.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const { error } = await createClient().from("clients").update(parsed.data).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/clientes?ok=atualizado");
}

export async function excluirCliente(fd: FormData) {
  await exigirPermissao("clients", "delete");
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? "/clientes");

  const { error } = await createClient().from("clients").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "excluido"));
}
