"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { carregarContextoAcesso } from "@/lib/services/acesso";
import { COOKIE_UNIDADE, TODAS } from "@/lib/unidade-atual";

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function selecionarUnidade(unidadeId: string) {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");

  const valida = unidadeId === TODAS || ctx.unidades.some((u) => u.id === unidadeId);
  cookies().set(COOKIE_UNIDADE, valida ? unidadeId : TODAS, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}
