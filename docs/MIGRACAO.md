# Migração Lovable → Next.js / Supabase / Vercel

**Status em 30/09/2026:** Fase 0 e Fase 1 entregues em PRs (empilhados). O Lovable saiu de cena; tudo vive neste repositório.

## Decisões fechadas

| Tema | Decisão |
|---|---|
| Fonte de verdade | O schema herdado do Lovable (57 tabelas, em inglês). Os docs antigos estão em `docs/legado/` e **não valem mais**. |
| Lógica de negócio | Fica no banco (funções, triggers, pg_cron) por enquanto. Migrar para código é projeto futuro, módulo a módulo. |
| Acesso ao banco | Cliente Supabase (`@supabase/ssr`) com tipos gerados. **Drizzle foi removido**: ele conectava direto no Postgres e ignorava as 211 políticas RLS que o app depende. |
| Dados | Não existe dado real. O sistema vai ao ar zerado. Sem migração de dados, sem cutover. |
| Ambientes | `rios-homolog` (Supabase) serve dev e homologação. Produção ganha um projeto Supabase próprio antes do go-live. |
| Quem decide | Mateus. O DEV trabalha por PR contra `main`. |

## Como o banco é versionado

- `supabase/migrations/20260930000000_baseline_lovable.sql` é o **ponto zero**: recria do zero tudo o que existe no `rios-homolog` (enums, tabelas, 136 funções, 118 triggers, 231 policies, views, buckets, jobs, seed mínimo).
- Toda alteração de schema entra como **nova migration** nessa pasta, nome `AAAAMMDDHHMMSS_descricao.sql`. Nunca editar o baseline depois de aplicado. Nada de SQL colado à mão no painel sem estar versionado aqui.
- Depois de aplicar uma migration, regerar os tipos: `npm run db:types` (precisa de `supabase login`).
- Para subir um ambiente novo (ex.: produção): criar o projeto Supabase, rodar o baseline e as migrations seguintes em ordem no SQL Editor (ou `supabase db push` com o projeto linkado).

## O que o banco faz sozinho (atenção ao construir telas)

- `handle_new_user()` roda no primeiro login: cria `profiles` e `user_roles`. **O primeiro usuário a logar vira admin.**
- `set_updated_at()` em quase todas as tabelas.
- `tg_audit_log()` / `tg_write_audit()` gravam em `audit_log` em todo insert/update/delete das tabelas de negócio.
- `enforce_period_close()` bloqueia edição de `transactions`, `payables`, `receivables` em período fechado (flag `closing_lock_enabled`).
- `generate_loan_installments()` cria as parcelas ao inserir um `loans`.
- `tg_notify_became_overdue()` gera `notifications` quando algo vira atrasado.
- Jobs diários (pg_cron, 06:00 UTC): `mark_overdue()`, `generate_recurring_payables()`, `generate_recurring_receivables()`.
- Feature flags em `haras_feature_flags`: `closing_lock_enabled`, `auto_cashflow_on_paid`, `sales_enabled`, `notifications_enabled`, `haras_reproducao_enabled`. Todas desligadas por padrão.
- Controle de acesso: `is_admin()`, `has_permission(user, module, action)`, `can_access_unit(user, unit)`. Admin vê tudo; member vê só as unidades em `user_unit_access` e os módulos em `user_module_permissions`.

## Fases

1. **Fase 0 – organizar a casa** (este PR): baseline do banco versionado, tipos gerados, Drizzle removido, docs legados arquivados, fluxo por PR.
2. **Fase 1 – base do app** (PR 2): login/logout, troca de senha obrigatória (`must_change_password`), layout com menu lateral e seletor de unidade persistido em cookie, contexto de acesso (`lib/services/acesso.ts`) espelhando `is_admin()`/`has_permission()`/`can_access_unit()`, uma rota por módulo com guarda de permissão, dashboard com resumo real do mês.
3. **Fase 2+ – módulos por prioridade:** Movimentações (PR 4: listagem por mês com filtros e totais, criar/editar/excluir, marcar pago/pendente; transferências e ajustes aparecem com selo e não são editados aqui), depois Contas a Pagar/Receber, empréstimos, reservas, contas bancárias, e por último o bloco haras.
4. **Pré go-live:** Supabase de produção, variáveis separadas na Vercel, usuários reais, backup.

## Pendências conhecidas

- Job `mark-overdue-daily` (03:00) duplicado com `rios_mark_overdue` (06:00) no `rios-homolog`. O baseline já traz só um; falta remover o duplicado no homolog: `select cron.unschedule('mark-overdue-daily');`
- Advisor de segurança do Supabase: extensão `pg_net` no schema `public` e funções SECURITY DEFINER executáveis por `anon`. O baseline já cria `pg_net` em `extensions`; a revogação de execute para `anon` entra numa migration própria.
- Buckets `animal-photos`, `avatars`, `client-docs`, `haras-purchase-contracts` e `sale-contracts` têm policies mas não existiam no homolog. O baseline os cria (privados).
- As variáveis de ambiente na Vercel foram criadas em maio, antes do `rios-homolog` existir, e apontam para outro banco. Trocar no painel da Vercel (são do tipo *sensitive*, a API não deixa editar por fora): `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para os valores do homolog; `DATABASE_URL`, `DIRECT_URL` e `SUPABASE_SECRET_KEY` podem ser removidas (não são mais usadas).
- Nenhum usuário existe no Auth do homolog. Criar o primeiro em Authentication → Users no painel; ele vira admin pelo trigger. Marcar `must_change_password` no profile se a senha for provisória.
- Módulo **Equipe e Acessos** (`team`) precisa criar usuários, o que exige a chave secreta no servidor (`auth.admin.createUser`). Entra numa fase própria, com `SUPABASE_SECRET_KEY` só na Vercel.
