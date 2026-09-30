// Unidades de negocio (tabela business_units). Regra de acesso igual a can_access_unit() do banco:
// admin enxerga todas; member enxerga apenas as listadas em user_unit_access.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type TipoUnidade = Database["public"]["Enums"]["business_unit_type"];

export type Unidade = {
  id: string;
  nome: string;
  tipo: TipoUnidade;
  icone: string;
  cor: string;
};

export async function listarUnidadesDoUsuario(
  supabase: SupabaseServerClient,
  userId: string,
  isAdmin: boolean
): Promise<Unidade[]> {
  const { data: units, error } = await supabase
    .from("business_units")
    .select("id, name, type, icon, color")
    .order("name");
  if (error) throw new Error(`Falha ao listar unidades: ${error.message}`);

  let permitidas: Set<string> | null = null;
  if (!isAdmin) {
    const { data: access } = await supabase
      .from("user_unit_access")
      .select("business_unit_id")
      .eq("user_id", userId);
    permitidas = new Set((access ?? []).map((a) => a.business_unit_id));
  }

  return (units ?? [])
    .filter((u) => !permitidas || permitidas.has(u.id))
    .map((u) => ({ id: u.id, nome: u.name, tipo: u.type, icone: u.icon, cor: u.color }));
}
