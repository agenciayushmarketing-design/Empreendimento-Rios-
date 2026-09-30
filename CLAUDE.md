# Empreendimento Rios

Painel gerencial financeiro para uma dona de 5 negócios (escritório, eventos, locação, empréstimos, haras).
Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui, Supabase (Postgres, Auth, Storage, RLS), deploy na Vercel.

## Regras que não mudam

- **Fonte de verdade do banco:** `supabase/migrations/`. O schema veio do Lovable (inglês, prefixo `haras_` para o módulo haras). Nunca seguir `docs/legado/` para modelagem.
- **Acesso a dados só pelo cliente Supabase** (`lib/supabase/server.ts` no servidor, `lib/supabase/client.ts` no navegador). Sem conexão direta ao Postgres. A RLS é a segurança; o app não a substitui.
- **Tipos do banco** em `lib/supabase/database.types.ts`, gerados. Nunca editar à mão; regerar com `npm run db:types` após cada migration.
- **Lógica de negócio vive no banco** (funções, triggers, cron). Antes de escrever uma tela, ler a seção "O que o banco faz sozinho" em `docs/MIGRACAO.md` para não duplicar efeitos.
- **Mudança de schema = nova migration** em `supabase/migrations/`, nunca SQL solto no painel.
- UI em português. Datas `dd/mm/aaaa`, valores `R$ 1.234,56`. Os valores no banco são `numeric(14,2)`.
- Em dúvida sobre regra de negócio, perguntar ao Mateus. Não chutar.

## Comandos

```bash
npm run dev        # http://localhost:3000
npm run build
npm run db:types   # regera lib/supabase/database.types.ts (precisa de `supabase login`)
```
