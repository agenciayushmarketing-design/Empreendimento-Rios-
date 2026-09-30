// Validacao de emprestimos e do recebimento de parcela.
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const uuid = z.string().uuid();
const uuidOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), uuid.nullable());
const dataISO = (msg: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg);

export const emprestimoSchema = z.object({
  business_unit_id: z.string().uuid("Escolha a unidade."),
  client_id: z.string().uuid("Escolha o tomador."),
  principal: z.preprocess(
    (v) => (typeof v === "string" ? parseValorBR(v) : v),
    z.number({ invalid_type_error: "Valor inválido. Use o formato 1.234,56." }).positive("O valor precisa ser maior que zero.")
  ),
  // Taxa digitada em % ao mes ("2,5") e guardada como fracao (0.025).
  monthly_rate: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? 0 : parseValorBR(v)) : v),
    z.number({ invalid_type_error: "Taxa inválida. Ex.: 2,5" }).min(0, "A taxa não pode ser negativa.").max(100, "Taxa alta demais.")
  ).transform((pct) => Math.round((pct / 100) * 100000) / 100000),
  start_date: dataISO("Informe a data do empréstimo."),
  term_months: z.preprocess((v) => Number(v), z.number({ invalid_type_error: "Informe o prazo." }).int().min(1, "Mínimo 1 mês.").max(600, "Máximo 600 meses.")),
});

export const recebimentoSchema = z.object({
  payment_date: dataISO("Informe a data do recebimento."),
  category_id: uuidOpcional,
  bank_account_id: uuidOpcional,
});

export function lerEmprestimo(fd: FormData) {
  const c = (k: string) => String(fd.get(k) ?? "");
  return {
    business_unit_id: c("business_unit_id"),
    client_id: c("client_id"),
    principal: c("principal"),
    monthly_rate: c("monthly_rate"),
    start_date: c("start_date"),
    term_months: c("term_months"),
  };
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}

// Mesma formula do trigger generate_loan_installments (tabela Price).
export function valorParcela(principal: number, taxaFracao: number, meses: number): number {
  if (meses <= 0) return 0;
  if (taxaFracao === 0) return Math.round((principal / meses) * 100) / 100;
  const f = Math.pow(1 + taxaFracao, meses);
  return Math.round(((principal * (taxaFracao * f)) / (f - 1)) * 100) / 100;
}
