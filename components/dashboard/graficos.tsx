"use client";

// Graficos do dashboard (recharts). Duas series fixas: Receitas (azul) e Despesas (laranja),
// cores validadas para daltonismo. Marcas finas, grade discreta, tooltip em R$.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const COR_RECEITAS = "#2a78d6";
export const COR_DESPESAS = "#eb6834";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const moedaCheia = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const eixo = { fontSize: 12, fill: "#737373" };

function formatarTooltip(valor: unknown) {
  return moedaCheia.format(Number(Array.isArray(valor) ? valor[0] : valor ?? 0));
}

export function GraficoUnidades({ dados }: { dados: { nome: string; receitas: number; despesas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} barGap={2} barCategoryGap="30%" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="3 3" />
        <XAxis dataKey="nome" tick={eixo} axisLine={false} tickLine={false} />
        <YAxis tick={eixo} axisLine={false} tickLine={false} tickFormatter={(v) => moeda.format(v)} width={80} />
        <Tooltip formatter={formatarTooltip} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend iconType="circle" iconSize={8} />
        <Bar dataKey="receitas" name="Receitas" fill={COR_RECEITAS} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="despesas" name="Despesas" fill={COR_DESPESAS} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoTendencia({ dados }: { dados: { mes: string; receitas: number; despesas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={dados} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="3 3" />
        <XAxis dataKey="mes" tick={eixo} axisLine={false} tickLine={false} />
        <YAxis tick={eixo} axisLine={false} tickLine={false} tickFormatter={(v) => moeda.format(v)} width={80} />
        <Tooltip formatter={formatarTooltip} />
        <Legend iconType="circle" iconSize={8} />
        <Line type="monotone" dataKey="receitas" name="Receitas" stroke={COR_RECEITAS} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="despesas" name="Despesas" stroke={COR_DESPESAS} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
