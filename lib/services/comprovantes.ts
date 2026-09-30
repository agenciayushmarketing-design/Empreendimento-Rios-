// Comprovantes (bucket privado "attachments"). O campo transactions.attachment_url guarda o
// caminho do objeto, nao uma URL: a URL assinada e gerada na hora de exibir e vale 1 hora.
import type { SupabaseServerClient } from "@/lib/supabase/server";

export const BUCKET = "attachments";
export const TAMANHO_MAXIMO = 5 * 1024 * 1024;
export const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function validarComprovante(arquivo: File | null): string | null {
  if (!arquivo || arquivo.size === 0) return null;
  if (arquivo.size > TAMANHO_MAXIMO) return "O comprovante precisa ter no máximo 5 MB.";
  if (!TIPOS_ACEITOS.includes(arquivo.type)) return "Envie o comprovante em PDF, JPG, PNG ou WebP.";
  return null;
}

function nomeSeguro(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(-80);
}

export async function enviarComprovante(
  supabase: SupabaseServerClient,
  unidadeId: string,
  transacaoId: string,
  arquivo: File
): Promise<{ caminho?: string; erro?: string }> {
  const caminho = `${unidadeId}/${transacaoId}-${Date.now()}-${nomeSeguro(arquivo.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, { contentType: arquivo.type, upsert: false });
  if (error) return { erro: error.message };
  return { caminho };
}

export async function removerComprovante(supabase: SupabaseServerClient, caminho: string | null | undefined) {
  if (!caminho) return;
  await supabase.storage.from(BUCKET).remove([caminho]);
}

// URLs assinadas para os caminhos informados (ignora os que falharem).
export async function urlsAssinadas(supabase: SupabaseServerClient, caminhos: string[]): Promise<Map<string, string>> {
  const unicos = Array.from(new Set(caminhos.filter(Boolean)));
  if (unicos.length === 0) return new Map();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(unicos, 60 * 60);
  const mapa = new Map<string, string>();
  for (const d of data ?? []) if (d.path && d.signedUrl) mapa.set(d.path, d.signedUrl);
  return mapa;
}
