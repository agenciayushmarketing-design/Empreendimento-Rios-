// Validacao dos cadastros simples: categorias, clientes e contas bancarias.
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const unidade = z.string().uuid("Escolha a unidade.");
const textoOpcional = z.string().trim().max(200).transform((v) => (v === "" ? null : v));

export const categoriaSchema = z.object({
  business_unit_id: unidade,
  name: z.string().trim().min(2, "Informe o nome da categoria.").max(80, "Nome longo demais."),
  type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Escolha entre receita e despesa." }) }),
});

export const clienteSchema = z.object({
  business_unit_id: unidade,
  name: z.string().trim().min(2, "Informe o nome.").max(120, "Nome longo demais."),
  email: z
    .string()
    .trim()
    .max(200)
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido."),
  phone: textoOpcional,
});

export const TIPOS_CONTA = {
  checking: "Conta corrente",
  savings: "Poupança",
  cash: "Dinheiro em caixa",
  card: "Cartão",
  investment: "Investimento",
  other: "Outra",
} as const;

export const contaBancariaSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da conta.").max(80, "Nome longo demais."),
  type: z.enum(["checking", "savings", "cash", "card", "investment", "other"], {
    errorMap: () => ({ message: "Escolha o tipo da conta." }),
  }),
  bank_name: textoOpcional,
  agency: textoOpcional,
  account_number: textoOpcional,
  initial_balance: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? 0 : parseValorBR(v)) : v),
    z.number({ invalid_type_error: "Saldo inicial inválido. Use o formato 1.234,56." })
  ),
  initial_balance_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data do saldo inicial."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.").default("#1E3A5F"),
  notes: textoOpcional,
  unidades: z.array(z.string().uuid()).default([]),
});

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}

export function campos(fd: FormData, nomes: string[]): Record<string, string> {
  const r: Record<string, string> = {};
  for (const n of nomes) r[n] = String(fd.get(n) ?? "");
  return r;
}
