// Reservas (reservations). Efeitos do banco (trigger on_reservation_status_change):
// confirmar cria uma conta a receber "Reserva: <titulo>" vencendo no termino; cancelar uma
// confirmada apaga essa conta se ainda pendente; concluir marca a conta como paga (sem gerar caixa,
// por isso o app recomenda receber pela tela de Contas a Receber antes de concluir).
// reservation_overlaps() detecta choque de datas na mesma unidade.
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { limitesDoMesISO } from "@/lib/utils/formatacao";

export type StatusReserva = "pending" | "confirmed" | "cancelled" | "completed";

export const STATUS_RESERVA: Record<StatusReserva, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Concluída",
};

export type Reserva = {
  id: string;
  business_unit_id: string;
  client_id: string | null;
  clienteNome: string | null;
  title: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: StatusReserva;
  notes: string | null;
  receivable_id: string | null;
  recebivelStatus: string | null;
};

// reservations nao tem chaves estrangeiras no schema herdado: nomes e status vem de consultas separadas.
const COLS = "id, business_unit_id, client_id, title, start_date, end_date, total_amount, status, notes, receivable_id";

type Linha = {
  id: string; business_unit_id: string; client_id: string | null; title: string; start_date: string; end_date: string;
  total_amount: number; status: StatusReserva; notes: string | null; receivable_id: string | null;
};

async function completar(supabase: SupabaseServerClient, linhas: Linha[]): Promise<Reserva[]> {
  const clienteIds = Array.from(new Set(linhas.map((l) => l.client_id).filter((x): x is string => Boolean(x))));
  const recebiveisIds = Array.from(new Set(linhas.map((l) => l.receivable_id).filter((x): x is string => Boolean(x))));
  const [{ data: clientes }, { data: recebiveis }] = await Promise.all([
    clienteIds.length ? supabase.from("clients").select("id, name").in("id", clienteIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    recebiveisIds.length ? supabase.from("receivables").select("id, status").in("id", recebiveisIds) : Promise.resolve({ data: [] as { id: string; status: string }[] }),
  ]);
  const nome = new Map((clientes ?? []).map((c) => [c.id, c.name]));
  const statusRec = new Map((recebiveis ?? []).map((r) => [r.id, r.status]));
  return linhas.map((l) => ({
    id: l.id, business_unit_id: l.business_unit_id, client_id: l.client_id,
    clienteNome: l.client_id ? nome.get(l.client_id) ?? null : null,
    title: l.title, start_date: l.start_date, end_date: l.end_date, total_amount: Number(l.total_amount), status: l.status,
    notes: l.notes, receivable_id: l.receivable_id,
    recebivelStatus: l.receivable_id ? statusRec.get(l.receivable_id) ?? null : null,
  }));
}

export async function listarReservas(supabase: SupabaseServerClient, unidadeId: string | null, mes: string | null, status?: StatusReserva) {
  let q = supabase.from("reservations").select(COLS).order("start_date", { ascending: true });
  if (unidadeId) q = q.eq("business_unit_id", unidadeId);
  if (status) q = q.eq("status", status);
  if (mes) {
    // Reservas que tocam o mes (comecam antes do fim e terminam depois do inicio).
    const { inicio, fim } = limitesDoMesISO(mes);
    q = q.lte("start_date", fim).gte("end_date", inicio);
  }
  const { data, error } = await q;
  if (error) throw new Error(`Falha ao listar reservas: ${error.message}`);
  return completar(supabase, (data ?? []) as Linha[]);
}

export async function obterReserva(supabase: SupabaseServerClient, id: string): Promise<Reserva | null> {
  const { data } = await supabase.from("reservations").select(COLS).eq("id", id).maybeSingle();
  if (!data) return null;
  const [r] = await completar(supabase, [data as Linha]);
  return r ?? null;
}

export async function temConflito(supabase: SupabaseServerClient, unidadeId: string, inicio: string, fim: string, ignorarId: string | null) {
  const { data, error } = await supabase.rpc("reservation_overlaps", {
    _unit_id: unidadeId,
    _start: inicio,
    _end: fim,
    _ignore_id: ignorarId as unknown as string,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}
