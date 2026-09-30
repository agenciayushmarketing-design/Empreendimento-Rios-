"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Banknote,
  CalendarDays,
  Contact,
  FileText,
  Landmark,
  LayoutDashboard,
  PackagePlus,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONES: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  movimentacoes: ArrowLeftRight,
  receber: ArrowDownToLine,
  pagar: ArrowUpFromLine,
  banco: Landmark,
  contrato: FileText,
  emprestimos: Banknote,
  reservas: CalendarDays,
  clientes: Users,
  funcionarios: Contact,
  categorias: Tags,
  vendas: ShoppingCart,
  compras: PackagePlus,
  equipe: ShieldCheck,
};

export function NavIcone({ nome, className }: { nome: string; className?: string }) {
  const Icone = ICONES[nome] ?? LayoutDashboard;
  return <Icone className={className} aria-hidden="true" />;
}
