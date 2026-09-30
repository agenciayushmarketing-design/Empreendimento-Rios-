// Helpers do bloco haras. As tabelas haras_* sao protegidas so por acesso a unidade (sem
// permissao por modulo): quem enxerga a unidade do tipo "haras" usa o modulo inteiro.
import { redirect } from "next/navigation";

import { carregarContextoAcesso, type ContextoAcesso } from "@/lib/services/acesso";
import type { Unidade } from "@/lib/services/unidades";

export function unidadeHaras(ctx: ContextoAcesso): Unidade | null {
  return ctx.unidades.find((u) => u.tipo === "haras") ?? null;
}

// Garante sessao e uma unidade haras visivel. Sem unidade haras, manda para o painel do haras,
// que explica ao admin como criar a unidade.
export async function exigirHaras(): Promise<{ ctx: ContextoAcesso; haras: Unidade }> {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  const haras = unidadeHaras(ctx);
  if (!haras) redirect("/haras");
  return { ctx, haras };
}

export { STATUS_ANIMAL, SEXO_ANIMAL, STATUS_PARTE, TIPOS_UNIDADE } from "./haras-rotulos";
