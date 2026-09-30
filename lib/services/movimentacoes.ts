// Movimentacoes (tabela transactions). Leitura para listagem e formulario.
// Efeitos automaticos do banco nesta tabela: set_updated_at, tg_audit_log (audit_log) e
// enforce_period_close (bloqueia alterar/excluir registro com closed_at quando a flag
// closing_lock_enabled da unidade esta ligada).
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { limitesDoMesISO } from "@/lib/utils/formatacao";

export const POR_PAGINA = 50;

export type TipoMov = "income" | "expense";

export type FiltrosMovimentacoes = {
  unidadeId: string | null; // null = todas as permitidas
  mes: string; // "AAAA-MM"
  tipo?: TipoMov;
  status?: string;
  busca?: string;
  pagina: number;
};

// String unica (nao concatenada) para o supabase-js inferir os tipos. bank_accounts tem duas FKs a partir
// de transactions (bank_account_id e transfer_counterpart_account_id); por isso o nome da FK no embed.
const COLUNAS_LISTA =
  "id, business_unit_id, date, description, type, amount, status, is_transfer, is_adjustment, closed_at, reconciled_at, attachment_url, category:categories(name), client:clients(name), bank_account:bank_accounts!transactions_bank_account_id_fkey(name)";

export async function listarMovimentacoes(supabase: SupabaseServerClient, f: FiltrosMovimentacoes) {
  const { inicio, fim } = limitesDoMesISO(f.mes);
  const de = (f.pagina - 1) * POR_PAGINA;

  let consulta = supabase
    .from("transactions")
    .select(COLUNAS_LISTA, { count: "exact" })
    .gte("date", inicio)
    .lte("date", fim)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(de, de + POR_PAGINA - 1);

  let totais = supabase.from("transactions").select("type, amount, status").gte("date", inicio).lte("date", fim);

  if (f.unidadeId) {
    consulta = consulta.eq("business_unit_id", f.unidadeId);
    totais = totais.eq("business_unit_id", f.unidadeId);
  }
  if (f.tipo) {
    consulta = consulta.eq("type", f.tipo);
    totais = totais.eq("type", f.tipo);
  }
  if (f.status === "paid" || f.status === "pending") {
    consulta = consulta.eq("status", f.status);
    totais = totais.eq("status", f.status);
  }
  if (f.busca) {
    const termo = `%${f.busca.replace(/[%_]/g, "")}%`;
    consulta = consulta.ilike("description", termo);
    totais = totais.ilike("description", termo);
  }

  const [{ data, error, count }, { data: linhasTotais }] = await Promise.all([consulta, totais]);
  if (error) throw new Error(`Falha ao listar movimentações: ${error.message}`);

  let receitasPagas = 0;
  let despesasPagas = 0;
  let pendentes = 0;
  for (const l of linhasTotais ?? []) {
    if (l.status !== "paid") {
      pendentes += Number(l.amount);
      continue;
    }
    if (l.type === "income") receitasPagas += Number(l.amount);
    else despesasPagas += Number(l.amount);
  }

  return {
    linhas: data ?? [],
    total: count ?? 0,
    totais: { receitasPagas, despesasPagas, saldo: receitasPagas - despesasPagas, pendentes },
  };
}

export type MovimentacaoLinha = Awaited<ReturnType<typeof listarMovimentacoes>>["linhas"][number];

export async function obterMovimentacao(supabase: SupabaseServerClient, id: string) {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, business_unit_id, date, description, type, amount, status, category_id, client_id, bank_account_id, is_transfer, is_adjustment, closed_at, reconciled_at, attachment_url"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Falha ao carregar movimentação: ${error.message}`);
  return data;
}

// Listas de apoio do formulario. Vem tudo o que a RLS deixa ver; o filtro por unidade/tipo e feito
// no cliente para o formulario reagir sem ir ao servidor.
export async function opcoesDoFormulario(supabase: SupabaseServerClient) {
  const [{ data: categorias }, { data: clientes }, { data: contas }, { data: vinculos }] = await Promise.all([
    supabase.from("categories").select("id, business_unit_id, name, type").order("name"),
    supabase.from("clients").select("id, business_unit_id, name").order("name"),
    supabase.from("bank_accounts").select("id, name, bank_name").eq("is_active", true).order("name"),
    supabase.from("bank_account_units").select("bank_account_id, business_unit_id"),
  ]);

  const unidadesPorConta = new Map<string, string[]>();
  for (const v of vinculos ?? []) {
    (unidadesPorConta.get(v.bank_account_id) ?? unidadesPorConta.set(v.bank_account_id, []).get(v.bank_account_id))!.push(
      v.business_unit_id
    );
  }

  return {
    categorias: categorias ?? [],
    clientes: clientes ?? [],
    // Conta sem vinculo serve para qualquer unidade (mesma regra de can_use_bank_account).
    contas: (contas ?? []).map((c) => ({
      id: c.id,
      nome: c.bank_name ? `${c.name} · ${c.bank_name}` : c.name,
      unidades: unidadesPorConta.get(c.id) ?? [],
    })),
  };
}

export type OpcoesFormulario = Awaited<ReturnType<typeof opcoesDoFormulario>>;

// Todas as linhas do filtro (sem paginacao), para exportar. Limite de seguranca de 5000.
export async function exportarMovimentacoes(
  supabase: SupabaseServerClient,
  f: Omit<FiltrosMovimentacoes, "pagina">
) {
  const { inicio, fim } = limitesDoMesISO(f.mes);
  let consulta = supabase
    .from("transactions")
    .select(COLUNAS_LISTA)
    .gte("date", inicio)
    .lte("date", fim)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(5000);
  if (f.unidadeId) consulta = consulta.eq("business_unit_id", f.unidadeId);
  if (f.tipo) consulta = consulta.eq("type", f.tipo);
  if (f.status === "paid" || f.status === "pending") consulta = consulta.eq("status", f.status);
  if (f.busca) consulta = consulta.ilike("description", `%${f.busca.replace(/[%_]/g, "")}%`);
  const { data, error } = await consulta;
  if (error) throw new Error(`Falha ao exportar: ${error.message}`);
  return data ?? [];
}
