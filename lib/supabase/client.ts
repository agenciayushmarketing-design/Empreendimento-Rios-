// Cliente Supabase para uso no navegador (Client Components).
// Usa a publishable key - vai parar no bundle do cliente, e tudo bem.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
