// Validacao do formulario de movimentacao (tabela transactions). Zod roda na server action;
// o banco (constraints, RLS, triggers) continua sendo a ultima barreira.
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const uuid = z.string().uuid();
const uuidOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), uuid.nullable());

export const movimentacaoSchema = z.object({
  business_unit_id: uuid.or(z.literal("")).refine((v) => v !== "", "Escolha a unidade."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data."),
  type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Escolha entre receita e despesa." }) }),
  description: z.string().trim().min(2, "Descreva a movimentação.").max(200, "Descrição longa demais."),
  amount: z.preprocess(
    (v) => (typeof v === "string" ? parseValorBR(v) : v),
    z
      .number({ invalid_type_error: "Valor inválido. Use o formato 1.234,56." })
      .positive("O valor precisa ser maior que zero.")
  ),
  status: z.enum(["paid", "pending"], { errorMap: () => ({ message: "Escolha o status." }) }),
  category_id: uuidOpcional,
  client_id: uuidOpcional,
  bank_account_id: uuidOpcional,
});

export type MovimentacaoInput = z.infer<typeof movimentacaoSchema>;

export function lerFormulario(fd: FormData) {
  const campo = (k: string) => String(fd.get(k) ?? "");
  return {
    business_unit_id: campo("business_unit_id"),
    date: campo("date"),
    type: campo("type"),
    description: campo("description"),
    amount: campo("amount"),
    status: campo("status"),
    category_id: campo("category_id"),
    client_id: campo("client_id"),
    bank_account_id: campo("bank_account_id"),
  };
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}
