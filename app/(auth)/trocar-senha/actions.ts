"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function trocarSenha(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (senha.length < 8) {
    redirect("/trocar-senha?erro=" + encodeURIComponent("A senha precisa ter pelo menos 8 caracteres."));
  }
  if (senha !== confirmacao) {
    redirect("/trocar-senha?erro=" + encodeURIComponent("As senhas não conferem."));
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    redirect("/trocar-senha?erro=" + encodeURIComponent("Não foi possível trocar a senha. Tente outra."));
  }

  // A policy "users update own profile" permite o proprio usuario limpar a flag.
  await supabase.from("profiles").update({ must_change_password: false }).eq("id", user.id);

  redirect("/dashboard");
}
