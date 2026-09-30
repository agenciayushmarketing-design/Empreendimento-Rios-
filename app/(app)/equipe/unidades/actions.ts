"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { carregarContextoAcesso } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { traduzirErroBanco } from "@/lib/utils/erros";
import { campos, primeiroErro, unidadeSchema } from "@/lib/validacao/haras";

export type EstadoFormulario = { erro?: string };

async function exigirAdmin() {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/dashboard?erro=sem-acesso");
  return ctx;
}

function revalidar() {
  revalidatePath("/", "layout");
}

// Unidades de negocio: uma por tipo (unique). O trigger seed_default_payroll_category cria a
// categoria de folha ao inserir.
export async function criarUnidade(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const parsed = unidadeSchema.safeParse(campos(fd, ["name", "type", "color"]));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient().from("business_units").insert(parsed.data);
  if (error) {
    return { erro: error.message.toLowerCase().includes("unique") ? "Já existe uma unidade desse tipo." : traduzirErroBanco(error.message) };
  }
  revalidar();
  redirect("/equipe/unidades?ok=criada");
}

export async function atualizarUnidade(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const parsed = unidadeSchema.pick({ name: true, color: true }).safeParse(campos(fd, ["name", "color"]));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const { error } = await createClient().from("business_units").update(parsed.data).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };
  revalidar();
  redirect("/equipe/unidades?ok=atualizada");
}
