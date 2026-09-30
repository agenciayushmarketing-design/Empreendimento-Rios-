// Validacao de contratos bancarios (criacao/renegociacao, quitacao e lancamento rotativo).
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const uuidOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.string().uuid().nullable());
const dataISO = (msg: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg);
const dataOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), dataISO("Data inválida.").nullable());
const valor = (msg: string) =>
  z.preprocess((v) => (typeof v === "string" ? parseValorBR(v) : v), z.number({ invalid_type_error: msg }).positive(msg));
const valorOpcional = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() === "" ? null : parseValorBR(v)) : v),
  z.number({ invalid_type_error: "Valor inválido." }).nullable()
);
const textoOpcional = z.string().trim().max(500).transform((v) => (v === "" ? null : v));

export const TIPOS_CONTRATO = {
  loan: "Empréstimo",
  working_capital: "Capital de giro",
  consortium: "Consórcio",
  revolving: "Rotativo / cheque especial",
  discounted_bill: "Desconto de duplicata",
} as const;

export const STATUS_CONTRATO = {
  active: "Ativo",
  paid_off: "Quitado",
  renegotiated: "Renegociado",
  cancelled: "Cancelado",
} as const;

export const contratoSchema = z
  .object({
    business_unit_id: z.string().uuid("Escolha a unidade."),
    institution: z.string().trim().min(2, "Informe o banco.").max(120),
    contract_number: z.string().trim().min(1, "Informe o número do contrato.").max(60),
    contract_type: z.enum(["loan", "working_capital", "consortium", "revolving", "discounted_bill"], {
      errorMap: () => ({ message: "Escolha o tipo do contrato." }),
    }),
    principal: valor("Informe o valor do contrato."),
    contract_date: dataISO("Informe a data do contrato."),
    installments_count: z.preprocess((v) => (v === "" || v === undefined ? null : Number(v)), z.number().int().min(1).max(600).nullable()),
    installment_amount: valorOpcional,
    first_due_date: dataOpcional,
    interest_rate_info: valorOpcional,
    bank_account_id: uuidOpcional,
    notes: textoOpcional,
  })
  .superRefine((d, ctx) => {
    if (d.contract_type === "revolving") return;
    if (!d.installments_count) ctx.addIssue({ code: "custom", path: ["installments_count"], message: "Informe a quantidade de parcelas." });
    if (!d.installment_amount) ctx.addIssue({ code: "custom", path: ["installment_amount"], message: "Informe o valor da parcela." });
    if (!d.first_due_date) ctx.addIssue({ code: "custom", path: ["first_due_date"], message: "Informe o primeiro vencimento." });
  });

export type ContratoInput = z.infer<typeof contratoSchema>;

export const quitacaoSchema = z.object({
  settlement_amount: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? 0 : parseValorBR(v)) : v),
    z.number({ invalid_type_error: "Valor inválido." }).min(0, "O valor não pode ser negativo.")
  ),
  payment_date: dataISO("Informe a data do pagamento."),
  bank_account_id: z.string().uuid("Escolha a conta bancária."),
  expense_category_id: z.string().uuid("Escolha a categoria de despesa."),
  notes: textoOpcional,
});

export const rotativoSchema = z.object({
  amount: valor("Informe o valor."),
  description: z.string().trim().max(200).transform((v) => (v === "" ? null : v)),
  due_date: dataISO("Informe o vencimento."),
  expense_category_id: z.string().uuid("Escolha a categoria de despesa."),
});

export function lerContrato(fd: FormData) {
  const c = (k: string) => String(fd.get(k) ?? "");
  return {
    business_unit_id: c("business_unit_id"),
    institution: c("institution"),
    contract_number: c("contract_number"),
    contract_type: c("contract_type"),
    principal: c("principal"),
    contract_date: c("contract_date"),
    installments_count: c("installments_count"),
    installment_amount: c("installment_amount"),
    first_due_date: c("first_due_date"),
    interest_rate_info: c("interest_rate_info"),
    bank_account_id: c("bank_account_id"),
    notes: c("notes"),
  };
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}
