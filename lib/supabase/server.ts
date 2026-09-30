// Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
// Le e grava os cookies de sessao via next/headers. Todas as consultas passam pela RLS
// do banco - o cliente carrega a sessao do usuario, nunca a chave secreta.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O metodo set lanca quando chamado de Server Component.
            // Tudo bem: o middleware ja refresca os cookies a cada request.
          }
        },
      },
    }
  );
}

export type SupabaseServerClient = ReturnType<typeof createClient>;
