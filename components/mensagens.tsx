// Faixas de sucesso e erro lidas da query string (?ok=...&erro=...).
export function Mensagens({ ok, erro, textosOk }: { ok?: string; erro?: string; textosOk: Record<string, string> }) {
  return (
    <>
      {ok && textosOk[ok] ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">{textosOk[ok]}</p>
      ) : null}
      {erro ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{erro}</p>
      ) : null}
    </>
  );
}
