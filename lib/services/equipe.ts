// Usuarios do sistema: profiles + user_roles + user_unit_access + user_module_permissions.
// So admin enxerga os outros (RLS). O primeiro usuario criado no projeto virou admin pelo trigger.
import type { SupabaseServerClient } from "@/lib/supabase/server";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  senhaProvisoria: boolean;
  isAdmin: boolean;
  unidades: string[];
  permissoes: string[]; // "modulo:acao"
  criadoEm: string;
};

export async function listarUsuarios(supabase: SupabaseServerClient): Promise<Usuario[]> {
  const [{ data: perfis, error }, { data: roles }, { data: acessos }, { data: perms }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, is_active, must_change_password, created_at").order("full_name"),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("user_unit_access").select("user_id, business_unit_id"),
    supabase.from("user_module_permissions").select("user_id, module, action"),
  ]);
  if (error) throw new Error(`Falha ao listar usuários: ${error.message}`);

  const admins = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
  const unidadesPor = new Map<string, string[]>();
  for (const a of acessos ?? []) unidadesPor.set(a.user_id, [...(unidadesPor.get(a.user_id) ?? []), a.business_unit_id]);
  const permsPor = new Map<string, string[]>();
  for (const p of perms ?? []) permsPor.set(p.user_id, [...(permsPor.get(p.user_id) ?? []), `${p.module}:${p.action}`]);

  return (perfis ?? []).map((p) => ({
    id: p.id,
    nome: p.full_name || p.email,
    email: p.email,
    ativo: p.is_active,
    senhaProvisoria: p.must_change_password,
    isAdmin: admins.has(p.id),
    unidades: unidadesPor.get(p.id) ?? [],
    permissoes: permsPor.get(p.id) ?? [],
    criadoEm: p.created_at,
  }));
}

export async function obterUsuario(supabase: SupabaseServerClient, id: string): Promise<Usuario | null> {
  const todos = await listarUsuarios(supabase);
  return todos.find((u) => u.id === id) ?? null;
}
