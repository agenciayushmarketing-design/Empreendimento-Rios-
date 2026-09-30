// Destino dos links de e-mail do Supabase (recuperacao de senha, convite). Troca o codigo
// por uma sessao e segue para a pagina pedida em ?next=.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const destino = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }

  return NextResponse.redirect(
    `${origin}/login?erro=${encodeURIComponent("Link inválido ou expirado. Peça um novo em Esqueci minha senha.")}`
  );
}
