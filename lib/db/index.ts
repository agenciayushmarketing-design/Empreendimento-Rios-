// Cliente do banco (Drizzle + postgres-js). Usado pelo app em runtime.
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL nao definida. Confira o .env.local.");
}

// prepare:false e recomendado quando se usa o pooler de transacao do Supabase.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
