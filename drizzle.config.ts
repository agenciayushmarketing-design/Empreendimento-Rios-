import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Carrega .env.local para que `drizzle-kit generate/migrate` rodem fora do Next.
config({ path: ".env.local" });

// 'generate' (criar SQL) nao precisa de conexao real;
// 'migrate' usa a DIRECT_URL (porta 5432) - migracoes nao passam pelo pooler.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? "",
  },
  verbose: true,
  strict: true,
});
