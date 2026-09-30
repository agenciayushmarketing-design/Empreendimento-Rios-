"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function pedirRecuperacao(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/esqueci-senha?erro=" + encodeURIComponent("Informe o e-mail."));

  // O link do e-mail volta para /auth/callback, que troca o codigo por sessao e manda para /trocar-senha.
  const origem = process.env.NEXT_PUBLIC_SITE_URL ?? headers().get("origin") ?? "";
  const supabase = createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origem}/auth/callback?next=/trocar-senha` });

  // Mesma resposta exista ou nao o e-mail: nao revelar quem tem conta.
  redirect("/esqueci-senha?enviado=1");
}
