// Validacao do bloco haras: clientes, categorias, animais, socios, pesagens, movimentacoes e lancamentos.
import { z } from "zod";
import { parseValorBR } from "@/lib/utils/formatacao";

const texto = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v));
const dataISO = (msg: string) => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msg);
const dataOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), dataISO("Data inválida.").nullable());
const uuidOpcional = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.string().uuid().nullable());
const valor = (msg: string) =>
  z.preprocess((v) => (typeof v === "string" ? parseValorBR(v) : v), z.number({ invalid_type_error: msg }).positive(msg));

export const clienteHarasSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(120),
  document: texto(30),
  email: texto(200),
  phone: texto(40),
  address: texto(300),
  is_owner_account: z.preprocess((v) => v === "on" || v === "true", z.boolean()).default(false),
  notes: texto(500),
});

export const categoriaHarasSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da categoria.").max(80),
  type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Escolha entre receita e despesa." }) }),
});

export const animalSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do animal.").max(120),
  animal_type: texto(60),
  sex: z.preprocess((v) => (v === "" || v === undefined ? null : v), z.enum(["macho", "femea", "castrado"]).nullable()),
  registration_code: texto(60),
  birth_date: dataOpcional,
  entry_date: dataISO("Informe a data de entrada."),
  primary_client_id: z.string().uuid("Escolha o proprietário principal."),
  origin: texto(120),
  location_note: texto(200),
  emergency_phone: texto(40),
  notes: texto(1000),
});

export const socioSchema = z.object({ client_id: z.string().uuid(), ownership_percentage: z.number().positive().max(100) });

// Socios vem do formulario como pares client_id[] / percentual[] (strings).
export function lerSocios(fd: FormData): { client_id: string; ownership_percentage: number }[] {
  const ids = fd.getAll("socio_client_id").map(String);
  const pcts = fd.getAll("socio_percentual").map(String);
  return ids
    .map((id, i) => ({ client_id: id, ownership_percentage: parseValorBR(pcts[i] ?? "") ?? 0 }))
    .filter((s) => s.client_id !== "" && s.ownership_percentage > 0);
}

export const pesagemSchema = z.object({
  weighed_at: dataISO("Informe a data da pesagem."),
  weight_kg: valor("Informe o peso em kg."),
  notes: texto(200),
});

export const movimentacaoAnimalSchema = z.object({
  moved_at: dataISO("Informe a data."),
  to_location: z.string().trim().min(2, "Informe o destino.").max(200),
  from_location: texto(200),
  reason: texto(200),
});

export const lancamentoAnimalSchema = z.object({
  type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Escolha entre receita e despesa." }) }),
  category_id: uuidOpcional,
  date: dataISO("Informe a data."),
  description: z.string().trim().min(2, "Descreva o lançamento.").max(200),
  amount: valor("Informe o valor."),
  notes: texto(300),
});

export const unidadeSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da unidade.").max(80),
  type: z.enum(["office", "events", "rental", "loans", "haras"], { errorMap: () => ({ message: "Escolha o tipo." }) }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.").default("#1E3A5F"),
});

export function campos(fd: FormData, nomes: string[]): Record<string, string> {
  const r: Record<string, string> = {};
  for (const n of nomes) r[n] = String(fd.get(n) ?? "");
  return r;
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}
