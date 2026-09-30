// Validacao do cadastro de usuarios (Equipe e Acessos).
import { z } from "zod";
import { MODULOS } from "@/lib/modulos";

export const ACOES = ["view", "create", "edit", "delete"] as const;
export type Acao = (typeof ACOES)[number];

const chavesModulo = new Set<string>(MODULOS.map((m) => m.chave));

export const usuarioSchema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome.").max(120, "Nome longo demais."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(8, "A senha provisória precisa ter pelo menos 8 caracteres.").max(72),
  role: z.enum(["admin", "member"], { errorMap: () => ({ message: "Escolha o papel." }) }),
  is_active: z.boolean().default(true),
  unidades: z.array(z.string().uuid()).default([]),
  permissoes: z
    .array(z.string())
    .default([])
    .transform((lista) =>
      lista
        .map((p) => p.split(":"))
        .filter(([m, a]) => chavesModulo.has(m) && (ACOES as readonly string[]).includes(a))
        .map(([module, action]) => ({ module, action }))
    ),
});

export const usuarioEdicaoSchema = usuarioSchema.omit({ email: true, password: true });

export const senhaSchema = z.object({
  password: z.string().min(8, "A senha provisória precisa ter pelo menos 8 caracteres.").max(72),
});

export function lerUsuario(fd: FormData) {
  return {
    full_name: String(fd.get("full_name") ?? ""),
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
    role: String(fd.get("role") ?? ""),
    is_active: String(fd.get("is_active") ?? "on") === "on",
    unidades: fd.getAll("unidades").map(String),
    permissoes: fd.getAll("permissoes").map(String),
  };
}

export function primeiroErro(r: z.SafeParseError<unknown>): string {
  return r.error.issues[0]?.message ?? "Dados inválidos.";
}
