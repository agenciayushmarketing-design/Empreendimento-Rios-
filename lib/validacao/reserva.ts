// Validacao de reservas (espaco de eventos / locacao).
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const dataISO = (msg: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg);

export const reservaSchema = z
  .object({
    business_unit_id: z.string().uuid("Escolha a unidade."),
    client_id: z.preprocess((v) => (v === "" || v === undefined ? null : v), z.string().uuid().nullable()),
    title: z.string().trim().min(2, "Dê um título à reserva.").max(120, "Título longo demais."),
    start_date: dataISO("Informe a data de início."),
    end_date: dataISO("Informe a data de término."),
    total_amount: z.preprocess(
      (v) => (typeof v === "string" ? (v.trim() === "" ? 0 : parseValorBR(v)) : v),
      z.number({ invalid_type_error: "Valor inválido. Use o formato 1.234,56." }).min(0, "O valor não pode ser negativo.")
    ),
    status: z.enum(["pending", "confirmed"], { errorMap: () => ({ message: "Escolha a situação." }) }),
    notes: z.string().trim().max(500).transform((v) => (v === "" ? null : v)),
  })
  .refine((d) => d.end_date >= d.start_date, { message: "O término não pode ser antes do início.", path: ["end_date"] });

export type ReservaInput = z.infer<typeof reservaSchema>;

export function lerReserva(fd: FormData) {
  const c = (k: string) => String(fd.get(k) ?? "");
  return {
    business_unit_id: c("business_unit_id"),
    client_id: c("client_id"),
    title: c("title"),
    start_date: c("start_date"),
    end_date: c("end_date"),
    total_amount: c("total_amount"),
    status: c("status"),
    notes: c("notes"),
  };
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}
