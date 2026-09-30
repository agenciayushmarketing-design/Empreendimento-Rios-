// Catalogo dos modulos do sistema. A chave e o enum app_module do banco;
// o resto e apresentacao (rota, rotulo em portugues, icone lucide).
import type { Database } from "@/lib/supabase/database.types";

export type Modulo = Database["public"]["Enums"]["app_module"];

export type ModuloInfo = {
  chave: Modulo;
  rotulo: string;
  rota: string;
  icone: string; // nome do icone em components/nav-icones.tsx
};

export const MODULOS: ModuloInfo[] = [
  { chave: "dashboard", rotulo: "Dashboard", rota: "/dashboard", icone: "dashboard" },
  { chave: "cash_flow", rotulo: "Movimentações", rota: "/movimentacoes", icone: "movimentacoes" },
  { chave: "receivables", rotulo: "Contas a Receber", rota: "/contas-a-receber", icone: "receber" },
  { chave: "payables", rotulo: "Contas a Pagar", rota: "/contas-a-pagar", icone: "pagar" },
  { chave: "bank_accounts", rotulo: "Contas Bancárias", rota: "/contas-bancarias", icone: "banco" },
  { chave: "bank_contracts", rotulo: "Contratos Bancários", rota: "/contratos-bancarios", icone: "contrato" },
  { chave: "loans", rotulo: "Empréstimos", rota: "/emprestimos", icone: "emprestimos" },
  { chave: "reservations", rotulo: "Reservas", rota: "/reservas", icone: "reservas" },
  { chave: "clients", rotulo: "Clientes", rota: "/clientes", icone: "clientes" },
  { chave: "employees", rotulo: "Funcionários", rota: "/funcionarios", icone: "funcionarios" },
  { chave: "categories", rotulo: "Categorias", rota: "/categorias", icone: "categorias" },
  { chave: "sales", rotulo: "Vendas de Animais", rota: "/vendas", icone: "vendas" },
  { chave: "haras_purchases", rotulo: "Compras do Haras", rota: "/haras/compras", icone: "compras" },
  { chave: "team", rotulo: "Equipe e Acessos", rota: "/equipe", icone: "equipe" },
];

export function moduloPorChave(chave: Modulo): ModuloInfo {
  const m = MODULOS.find((x) => x.chave === chave);
  if (!m) throw new Error(`Modulo desconhecido: ${chave}`);
  return m;
}
