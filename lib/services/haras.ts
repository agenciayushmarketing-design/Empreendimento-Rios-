// Bloco haras: clientes do haras, categorias de lancamento, animais (com socios, pesagens,
// movimentacoes de local) e lancamentos por animal com rateio entre socios.
// Efeitos do banco: tg_validate_primary_client_same_unit, tg_check_partners_100 (soma dos socios
// = 100, adiado ate o fim da transacao), tg_haras_tx_validate, tg_haras_tx_generate_shares (gera
// as partes de cada socio em haras_animal_transaction_shares), tg_haras_clients_block_delete_if_referenced.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { limitesDoMesISO, mesAtualISO } from "@/lib/utils/formatacao";

export type ClienteHaras = {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_owner_account: boolean;
  notes: string | null;
};

export type CategoriaHaras = { id: string; name: string; type: "income" | "expense" };

export type AnimalResumo = {
  id: string;
  name: string;
  animal_type: string | null;
  sex: "macho" | "femea" | "castrado" | null;
  registration_code: string | null;
  status: "active" | "sold" | "deceased" | "transferred";
  entry_date: string;
  primary_client_id: string;
  proprietario: string;
  socios: number;
};

export async function listarClientesHaras(supabase: SupabaseServerClient, unidadeId: string, busca?: string): Promise<ClienteHaras[]> {
  let q = supabase
    .from("haras_clients")
    .select("id, name, document, email, phone, address, is_owner_account, notes")
    .eq("business_unit_id", unidadeId)
    .order("name");
  if (busca) q = q.ilike("name", `%${busca.replace(/[%_]/g, "")}%`);
  const { data, error } = await q;
  if (error) throw new Error(`Falha ao listar clientes do haras: ${error.message}`);
  return data ?? [];
}

export async function listarCategoriasHaras(supabase: SupabaseServerClient, unidadeId: string): Promise<CategoriaHaras[]> {
  const { data, error } = await supabase
    .from("haras_animal_categories")
    .select("id, name, type")
    .eq("business_unit_id", unidadeId)
    .order("type")
    .order("name");
  if (error) throw new Error(`Falha ao listar categorias: ${error.message}`);
  return (data ?? []) as CategoriaHaras[];
}

export async function listarAnimais(supabase: SupabaseServerClient, unidadeId: string, status?: string, busca?: string): Promise<AnimalResumo[]> {
  let q = supabase
    .from("haras_animals")
    .select("id, name, animal_type, sex, registration_code, status, entry_date, primary_client_id")
    .eq("business_unit_id", unidadeId)
    .order("name");
  if (status) q = q.eq("status", status);
  if (busca) q = q.ilike("name", `%${busca.replace(/[%_]/g, "")}%`);
  const [{ data, error }, { data: clientes }, { data: socios }] = await Promise.all([
    q,
    supabase.from("haras_clients").select("id, name").eq("business_unit_id", unidadeId),
    supabase.from("haras_animal_partners").select("animal_id"),
  ]);
  if (error) throw new Error(`Falha ao listar animais: ${error.message}`);
  const nome = new Map((clientes ?? []).map((c) => [c.id, c.name]));
  const qtdSocios = new Map<string, number>();
  for (const s of socios ?? []) qtdSocios.set(s.animal_id, (qtdSocios.get(s.animal_id) ?? 0) + 1);
  return (data ?? []).map((a) => ({
    ...a,
    status: a.status as AnimalResumo["status"],
    proprietario: nome.get(a.primary_client_id) ?? "—",
    socios: qtdSocios.get(a.id) ?? 0,
  }));
}

export type AnimalDetalhe = {
  id: string;
  business_unit_id: string;
  name: string;
  animal_type: string | null;
  sex: "macho" | "femea" | "castrado" | null;
  registration_code: string | null;
  birth_date: string | null;
  entry_date: string;
  exit_date: string | null;
  status: "active" | "sold" | "deceased" | "transferred";
  primary_client_id: string;
  proprietario: string;
  origin: string | null;
  location_note: string | null;
  emergency_phone: string | null;
  notes: string | null;
  socios: { id: string; client_id: string; nome: string; ownership_percentage: number }[];
  pesagens: { id: string; weighed_at: string; weight_kg: number; notes: string | null }[];
  movimentacoes: { id: string; moved_at: string; from_location: string | null; to_location: string; reason: string | null }[];
  lancamentos: {
    id: string;
    type: "income" | "expense";
    date: string;
    description: string;
    amount: number;
    categoria: string | null;
    notes: string | null;
    partes: { id: string; client_id: string; nome: string; ownership_percentage: number; share_amount: number; status: "pending" | "settled" | "waived" }[];
  }[];
};

export async function obterAnimal(supabase: SupabaseServerClient, id: string): Promise<AnimalDetalhe | null> {
  const { data: a } = await supabase
    .from("haras_animals")
    .select("id, business_unit_id, name, animal_type, sex, registration_code, birth_date, entry_date, exit_date, status, primary_client_id, origin, location_note, emergency_phone, notes")
    .eq("id", id)
    .maybeSingle();
  if (!a) return null;

  const [{ data: clientes }, { data: categorias }, { data: socios }, { data: pesagens }, { data: movs }, { data: lancs }] = await Promise.all([
    supabase.from("haras_clients").select("id, name").eq("business_unit_id", a.business_unit_id),
    supabase.from("haras_animal_categories").select("id, name").eq("business_unit_id", a.business_unit_id),
    supabase.from("haras_animal_partners").select("id, client_id, ownership_percentage").eq("animal_id", id),
    supabase.from("haras_animal_weight_history").select("id, weighed_at, weight_kg, notes").eq("animal_id", id).order("weighed_at", { ascending: false }),
    supabase.from("haras_animal_movements").select("id, moved_at, from_location, to_location, reason").eq("animal_id", id).order("moved_at", { ascending: false }),
    supabase.from("haras_animal_transactions").select("id, type, date, description, amount, category_id, notes").eq("animal_id", id).order("date", { ascending: false }),
  ]);
  const nome = new Map((clientes ?? []).map((c) => [c.id, c.name]));
  const nomeCat = new Map((categorias ?? []).map((c) => [c.id, c.name]));

  const ids = (lancs ?? []).map((l) => l.id);
  const { data: partes } = ids.length
    ? await supabase.from("haras_animal_transaction_shares").select("id, transaction_id, client_id, ownership_percentage, share_amount, status").in("transaction_id", ids)
    : { data: [] as { id: string; transaction_id: string; client_id: string; ownership_percentage: number; share_amount: number; status: string }[] };
  const partesPor = new Map<string, AnimalDetalhe["lancamentos"][number]["partes"]>();
  for (const p of partes ?? []) {
    const lista = partesPor.get(p.transaction_id) ?? [];
    lista.push({
      id: p.id,
      client_id: p.client_id,
      nome: nome.get(p.client_id) ?? "—",
      ownership_percentage: Number(p.ownership_percentage),
      share_amount: Number(p.share_amount),
      status: p.status as "pending" | "settled" | "waived",
    });
    partesPor.set(p.transaction_id, lista);
  }

  return {
    ...a,
    sex: a.sex,
    status: a.status as AnimalDetalhe["status"],
    proprietario: nome.get(a.primary_client_id) ?? "—",
    socios: (socios ?? []).map((s) => ({ ...s, nome: nome.get(s.client_id) ?? "—", ownership_percentage: Number(s.ownership_percentage) })),
    pesagens: (pesagens ?? []).map((p) => ({ ...p, weight_kg: Number(p.weight_kg) })),
    movimentacoes: movs ?? [],
    lancamentos: (lancs ?? []).map((l) => ({
      id: l.id,
      type: l.type as "income" | "expense",
      date: l.date,
      description: l.description,
      amount: Number(l.amount),
      categoria: l.category_id ? nomeCat.get(l.category_id) ?? null : null,
      notes: l.notes,
      partes: partesPor.get(l.id) ?? [],
    })),
  };
}

export type PainelHaras = { animaisAtivos: number; clientes: number; receitasMes: number; despesasMes: number; partesPendentes: number };

export async function painelHaras(supabase: SupabaseServerClient, unidadeId: string): Promise<PainelHaras> {
  const { inicio, fim } = limitesDoMesISO(mesAtualISO());
  const [{ count: animais }, { count: clientes }, { data: lancs }, { count: pendentes }] = await Promise.all([
    supabase.from("haras_animals").select("id", { count: "exact", head: true }).eq("business_unit_id", unidadeId).eq("status", "active"),
    supabase.from("haras_clients").select("id", { count: "exact", head: true }).eq("business_unit_id", unidadeId),
    supabase.from("haras_animal_transactions").select("type, amount").eq("business_unit_id", unidadeId).gte("date", inicio).lte("date", fim),
    supabase.from("haras_animal_transaction_shares").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  let receitas = 0;
  let despesas = 0;
  for (const l of lancs ?? []) {
    if (l.type === "income") receitas += Number(l.amount);
    else despesas += Number(l.amount);
  }
  return { animaisAtivos: animais ?? 0, clientes: clientes ?? 0, receitasMes: receitas, despesasMes: despesas, partesPendentes: pendentes ?? 0 };
}
