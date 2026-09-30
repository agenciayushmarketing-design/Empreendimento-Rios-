// Servico de unidades de negocio (tabela business_units do schema herdado do Lovable).
// Regra de acesso, espelhando a funcao can_access_unit() do banco:
// admin enxerga todas as unidades; member enxerga apenas as listadas em user_unit_access.
import type { SupabaseServerClient } from "@/lib/supabase/server";

export type Unidade = {
  id: string;
  nome: string;
  tipo: "office" | "events" | "rental" | "loans" | "haras";
  icone: string;
  cor: string;
};

export async function listarUnidadesDoUsuario(
  supabase: SupabaseServerClient,
  userId: string
): Promise<Unidade[]> {
  const [{ data: units, error }, { data: roles }, { data: access }] = await Promise.all([
    supabase.from("business_units").select("id, name, type, icon, color").order("name"),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("user_unit_access").select("business_unit_id").eq("user_id", userId),
  ]);

  if (error) throw new Error(`Falha ao listar unidades: ${error.message}`);

  const isAdmin = (roles ?? []).some((r) => r.role === "admin");
  const permitidas = new Set((access ?? []).map((a) => a.business_unit_id));

  return (units ?? [])
    .filter((u) => isAdmin || permitidas.has(u.id))
    .map((u) => ({ id: u.id, nome: u.name, tipo: u.type, icone: u.icon, cor: u.color }));
}
