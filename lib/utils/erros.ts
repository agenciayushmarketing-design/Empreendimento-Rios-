// Mensagens do Postgres/RLS em linguagem de gente. Usado pelas server actions.
export function traduzirErroBanco(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("row-level security") || m.includes("permission denied") || m.includes("42501")) {
    return "Sem permissão para essa operação nessa unidade.";
  }
  if (m.includes("duplicate key") || m.includes("unique")) return "Já existe um registro com esse nome.";
  if (m.includes("foreign key") || m.includes("violates") || m.includes("restrict")) {
    return "Não é possível excluir: existem lançamentos ligados a este registro.";
  }
  if (m.includes("fechado")) return mensagem; // enforce_period_close ja fala portugues
  return `Não foi possível salvar: ${mensagem}`;
}

export function comParametro(url: string, chave: string, valor: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${chave}=${encodeURIComponent(valor)}`;
}
