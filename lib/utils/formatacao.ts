// Formatacao brasileira. Os valores no banco sao numeric(14,2); o PostgREST entrega como number.
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
// Datas sem hora sao formatadas em UTC: o valor ja e o dia civil, sem fuso a aplicar.
const data = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const mesExtenso = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

export function formatarMoeda(valor: number | string | null | undefined): string {
  return moeda.format(Number(valor ?? 0));
}

// Datas sem hora (date do Postgres) chegam como "AAAA-MM-DD"; montar em UTC evita pular um dia.
export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "";
  const [a, m, d] = valor.slice(0, 10).split("-").map(Number);
  return data.format(new Date(Date.UTC(a, m - 1, d)));
}

// "2026-09" -> "setembro de 2026"
export function formatarMes(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  return mesExtenso.format(new Date(Date.UTC(a, m - 1, 1)));
}

export function hojeISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

// "AAAA-MM" do mes corrente em Sao Paulo.
export function mesAtualISO(): string {
  return hojeISO().slice(0, 7);
}

// Primeiro e ultimo dia de um mes "AAAA-MM", como "AAAA-MM-DD".
export function limitesDoMesISO(mes: string): { inicio: string; fim: string } {
  const [a, m] = mes.split("-").map(Number);
  const ultimoDia = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return { inicio: `${a}-${mm}-01`, fim: `${a}-${mm}-${String(ultimoDia).padStart(2, "0")}` };
}

export function limitesDoMes(): { inicio: string; fim: string } {
  return limitesDoMesISO(mesAtualISO());
}

// Mes anterior / seguinte de um "AAAA-MM".
export function deslocarMes(mes: string, delta: number): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Aceita "1.234,56", "1234,56" e "1234.56". Devolve null se nao for numero.
export function parseValorBR(texto: string): number | null {
  const t = texto.trim().replace(/[R$\s]/g, "");
  if (!t) return null;
  const normalizado = /,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  const n = Number(normalizado);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

// Numero -> "1234,56" (para preencher campo de formulario).
export function valorParaCampo(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") return "";
  return Number(valor).toFixed(2).replace(".", ",");
}
