// Unidade selecionada no header, persistida em cookie. "todas" = visao consolidada.
// E filtro gerencial, nao seguranca: o cookie so e aceito se a unidade estiver entre as permitidas.
import { cookies } from "next/headers";
import type { Unidade } from "@/lib/services/unidades";

export const COOKIE_UNIDADE = "er_unidade";
export const TODAS = "todas";

export function lerUnidadeAtual(unidades: Unidade[]): string {
  const valor = cookies().get(COOKIE_UNIDADE)?.value;
  if (!valor || valor === TODAS) return TODAS;
  return unidades.some((u) => u.id === valor) ? valor : TODAS;
}

// null = todas as unidades (sem filtro).
export function unidadeIdOuNull(atual: string): string | null {
  return atual === TODAS ? null : atual;
}
