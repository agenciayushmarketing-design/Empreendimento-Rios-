// Contexto de acesso do usuario logado: perfil, papel, unidades e permissoes por modulo.
// Espelha as funcoes is_admin() / has_permission() / can_access_unit() do banco. A RLS continua
// sendo a seguranca de verdade; isto aqui decide o que mostrar e para onde redirecionar.
import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { listarUnidadesDoUsuario, type Unidade } from "./unidades";

export type Modulo = Database["public"]["Enums"]["app_module"];
export type Acao = Database["public"]["Enums"]["permission_action"];

export type ContextoAcesso = {
  userId: string;
  email: string;
  nome: string;
  ativo: boolean;
  isAdmin: boolean;
  deveTrocarSenha: boolean;
  unidades: Unidade[];
  permissoes: Partial<Record<Modulo, Acao[]>>;
};

// cache(): uma unica carga por request, mesmo que layout e pagina chamem.
export const carregarContextoAcesso = cache(async (): Promise<ContextoAcesso | null> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: perfil }, { data: roles }, { data: perms }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, is_active, must_change_password")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("user_module_permissions").select("module, action").eq("user_id", user.id),
  ]);

  const isAdmin = (roles ?? []).some((r) => r.role === "admin");
  const unidades = await listarUnidadesDoUsuario(supabase, user.id, isAdmin);

  const permissoes: Partial<Record<Modulo, Acao[]>> = {};
  for (const p of perms ?? []) {
    (permissoes[p.module] ??= []).push(p.action);
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    nome: perfil?.full_name || user.email || "",
    ativo: Boolean(perfil?.is_active),
    isAdmin,
    deveTrocarSenha: Boolean(perfil?.must_change_password),
    unidades,
    permissoes,
  };
});

export function pode(ctx: ContextoAcesso, modulo: Modulo, acao: Acao = "view"): boolean {
  return ctx.isAdmin || (ctx.permissoes[modulo] ?? []).includes(acao);
}

// Guarda de pagina: garante sessao e permissao, ou redireciona.
export async function exigirPermissao(modulo: Modulo, acao: Acao = "view"): Promise<ContextoAcesso> {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  if (!pode(ctx, modulo, acao)) redirect("/dashboard?erro=sem-acesso");
  return ctx;
}
