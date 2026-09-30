// Validacao de contas a pagar / a receber e da baixa.
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const uuid = z.string().uuid();
const uuidOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), uuid.nullable());
const valor = z.preprocess(
  (v) => (typeof v === "string" ? parseValorBR(v) : v),
  z.number({ invalid_type_error: "Valor inválido. Use o formato 1.234,56." }).positive("O valor precisa ser maior que zero.")
);
const dataISO = (msg: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg);

export const contaSchema = z.object({
  business_unit_id: z.string().uuid("Escolha a unidade."),
  description: z.string().trim().min(2, "Descreva a conta.").max(200, "Descrição longa demais."),
  amount: valor,
  due_date: dataISO("Informe o vencimento."),
  category_id: uuidOpcional,
  pessoa_id: uuidOpcional,
  preferred_bank_account_id: uuidOpcional,
  notes: z.string().trim().max(500).transform((v) => (v === "" ? null : v)),
  // Recorrencia (so contas a pagar): gera uma conta por mes ate o termino.
  recorrente: z.preprocess((v) => v === "on" || v === "true", z.boolean()).default(false),
  day_of_month: z.preprocess((v) => (v === "" || v === undefined ? undefined : Number(v)), z.number().int().min(1, "Dia entre 1 e 28.").max(28, "Dia entre 1 e 28.").optional()),
  end_date: z.preprocess((v) => (v === "" || v === undefined ? null : v), dataISO("Data de término inválida.").nullable()),
});

export type ContaInput = z.infer<typeof contaSchema>;

export const baixaSchema = z.object({
  payment_date: dataISO("Informe a data do pagamento."),
  category_id: uuidOpcional,
  bank_account_id: uuidOpcional,
});

export function lerConta(fd: FormData) {
  const c = (k: string) => String(fd.get(k) ?? "");
  return {
    business_unit_id: c("business_unit_id"),
    description: c("description"),
    amount: c("amount"),
    due_date: c("due_date"),
    category_id: c("category_id"),
    pessoa_id: c("pessoa_id"),
    preferred_bank_account_id: c("preferred_bank_account_id"),
    notes: c("notes"),
    recorrente: c("recorrente"),
    day_of_month: c("day_of_month"),
    end_date: c("end_date"),
  };
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}
