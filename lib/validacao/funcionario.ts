// Validacao de funcionarios e da geracao de folha.
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const dinheiro = z.preprocess(
  (v) => (typeof v === "string" ? (v.trim() === "" ? 0 : parseValorBR(v)) : v),
  z.number({ invalid_type_error: "Valor inválido. Use o formato 1.234,56." }).min(0, "Não pode ser negativo.")
);
const textoOpcional = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v));
const dataOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.").nullable());

export const funcionarioSchema = z.object({
  business_unit_id: z.string().uuid("Escolha a unidade."),
  full_name: z.string().trim().min(2, "Informe o nome.").max(120, "Nome longo demais."),
  role: textoOpcional(80),
  document: textoOpcional(30),
  admission_date: dataOpcional,
  default_base_salary: dinheiro,
  default_transport: dinheiro,
  default_meal: dinheiro,
  default_inss: dinheiro,
  default_fgts: dinheiro,
  default_other: dinheiro,
  notes: textoOpcional(500),
});

export type FuncionarioInput = z.infer<typeof funcionarioSchema>;

export const folhaSchema = z.object({
  business_unit_id: z.string().uuid("Escolha a unidade."),
  periodo: z.string().regex(/^\d{4}-\d{2}$/, "Informe o mês da folha."),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe o vencimento."),
  employee_ids: z.array(z.string().uuid()).default([]),
});

export function lerFuncionario(fd: FormData) {
  const c = (k: string) => String(fd.get(k) ?? "");
  return {
    business_unit_id: c("business_unit_id"),
    full_name: c("full_name"),
    role: c("role"),
    document: c("document"),
    admission_date: c("admission_date"),
    default_base_salary: c("default_base_salary"),
    default_transport: c("default_transport"),
    default_meal: c("default_meal"),
    default_inss: c("default_inss"),
    default_fgts: c("default_fgts"),
    default_other: c("default_other"),
    notes: c("notes"),
  };
}

export function liquidoEstimado(f: {
  default_base_salary: number; default_transport: number; default_meal: number;
  default_inss: number; default_fgts: number; default_other: number;
}): number {
  return Math.max(f.default_base_salary + f.default_transport + f.default_meal - f.default_inss - f.default_fgts - f.default_other, 0);
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}
