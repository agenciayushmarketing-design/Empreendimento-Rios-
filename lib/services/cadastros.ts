// Leitura dos cadastros simples: categorias, clientes e contas bancarias.
import type { SupabaseServerClient } from "@/lib/supabase/server";

export async function listarCategorias(supabase: SupabaseServerClient, unidadeId: string | null) {
  let q = supabase
    .from("categories")
    .select("id, business_unit_id, name, type, is_payroll")
    .order("type")
    .order("name");
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  const { data, error } = await q;
  if (error) throw new Error(`Falha ao listar categorias: ${error.message}`);
  return data ?? [];
}

export async function obterCategoria(supabase: SupabaseServerClient, id: string) {
  const { data } = await supabase
    .from("categories")
    .select("id, business_unit_id, name, type, is_payroll")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function listarClientes(supabase: SupabaseServerClient, unidadeId: string | null, busca?: string) {
  let q = supabase.from("clients").select("id, business_unit_id, name, email, phone").order("name");
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  if (busca) q = q.ilike("name", `%${busca.replace(/[%_]/g, "")}%`);
  const { data, error } = await q;
  if (error) throw new Error(`Falha ao listar clientes: ${error.message}`);
  return data ?? [];
}

export async function obterCliente(supabase: SupabaseServerClient, id: string) {
  const { data } = await supabase
    .from("clients")
    .select("id, business_unit_id, name, email, phone")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function listarContasBancarias(supabase: SupabaseServerClient) {
  const [{ data: contas, error }, { data: saldos }, { data: vinculos }] = await Promise.all([
    supabase
      .from("bank_accounts")
      .select("id, name, type, bank_name, agency, account_number, initial_balance, initial_balance_date, color, is_active")
      .order("is_active", { ascending: false })
      .order("name"),
    supabase.from("bank_account_balances").select("bank_account_id, realized_balance, last_movement_date, movements_count"),
    supabase.from("bank_account_units").select("bank_account_id, business_unit_id"),
  ]);
  if (error) throw new Error(`Falha ao listar contas: ${error.message}`);

  const saldoPor = new Map((saldos ?? []).map((s) => [s.bank_account_id, s]));
  const unidadesPor = new Map<string, string[]>();
  for (const v of vinculos ?? []) {
    const lista = unidadesPor.get(v.bank_account_id) ?? [];
    lista.push(v.business_unit_id);
    unidadesPor.set(v.bank_account_id, lista);
  }

  return (contas ?? []).map((c) => ({
    ...c,
    saldo: Number(saldoPor.get(c.id)?.realized_balance ?? c.initial_balance ?? 0),
    ultimaMovimentacao: saldoPor.get(c.id)?.last_movement_date ?? null,
    movimentacoes: Number(saldoPor.get(c.id)?.movements_count ?? 0),
    unidades: unidadesPor.get(c.id) ?? [],
  }));
}

export async function obterContaBancaria(supabase: SupabaseServerClient, id: string) {
  const [{ data: conta }, { data: vinculos }] = await Promise.all([
    supabase
      .from("bank_accounts")
      .select("id, name, type, bank_name, agency, account_number, initial_balance, initial_balance_date, color, notes, is_active")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("bank_account_units").select("business_unit_id").eq("bank_account_id", id),
  ]);
  if (!conta) return null;
  return { ...conta, unidades: (vinculos ?? []).map((v) => v.business_unit_id) };
}
