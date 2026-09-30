// Cliente administrativo (chave secreta), SO no servidor e SO para o que a chave publica nao
// faz: criar usuario, redefinir senha. Nunca importar em componente de cliente.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function temChaveSecreta(): boolean {
  return Boolean(process.env.SUPABASE_SECRET_KEY);
}

export function createAdminClient() {
  const chave = process.env.SUPABASE_SECRET_KEY;
  if (!chave) throw new Error("SUPABASE_SECRET_KEY não configurada.");
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
