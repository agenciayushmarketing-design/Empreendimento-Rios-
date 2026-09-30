// Formatacao brasileira. Os valores no banco sao numeric(14,2); o PostgREST entrega como number.
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const data = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" });

export function formatarMoeda(valor: number | string | null | undefined): string {
  return moeda.format(Number(valor ?? 0));
}

// Datas sem hora (date do Postgres) chegam como "AAAA-MM-DD"; montar em UTC evita pular um dia.
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "";
  const [a, m, d] = valor.slice(0, 10).split("-").map(Number);
  return data.format(new Date(Date.UTC(a, m - 1, d)));
}

export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

// Primeiro e ultimo dia do mes corrente, como "AAAA-MM-DD".
export function limitesDoMes(): { inicio: string; fim: string } {
  const hoje = hojeISO();
  const [a, m] = hoje.split("-").map(Number);
  const ultimoDia = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return { inicio: `${a}-${mm}-01`, fim: `${a}-${mm}-${String(ultimoDia).padStart(2, "0")}` };
}
