# Handoff para o Claude Code — Empreendimento Rios

## Leia isto primeiro

Este projeto foi planejado e iniciado em outra ferramenta. A construção do código continua agora com você, Claude Code. Este arquivo diz exatamente onde o projeto está e o que fazer em seguida.

Leia também, nesta mesma pasta `docs/`:

- `NEGOCIO.md` — o briefing de negócio (a "bússola": quem é a cliente, os 5 negócios, as regras). É o *porquê*.
- `TECNICO.md` — o roteiro técnico (9 seções: arquitetura, modelo de dados completo, lógica de negócio, jobs, telas, plano de sprints, decisões fechadas). É o *como*.

Regra de ouro: se algo no `TECNICO.md` conflitar com o `NEGOCIO.md`, o `NEGOCIO.md` vence.

## Stack

Next.js 14 (App Router) + TypeScript · Supabase (Postgres, Auth, Storage, RLS) · Drizzle ORM · shadcn/ui + Tailwind · deploy na Vercel. Detalhes nas Seções 1 e 2 do `TECNICO.md`.

## O que JÁ está pronto

### Esqueleto do projeto (já nesta pasta)

`package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `drizzle.config.ts`, `.env.example`, `.gitignore`; `lib/db/schema.ts` (schema Drizzle das 6 tabelas-base), `lib/db/index.ts` (cliente Drizzle postgres-js); `app/layout.tsx`, `app/page.tsx`, `app/globals.css` (esqueleto mínimo); `drizzle/0000_sprint0_base.sql` (migração gerada); `supabase/01_banco.sql` e `supabase/02_perfil.sql` (SQL já aplicado no banco).

### Banco de dados — JÁ ESTÁ NO AR no Supabase

O projeto Supabase do cliente já tem aplicado e funcionando:

- As 6 tabelas-base: `empresas`, `perfis`, `unidades_negocio`, `contas_financeiras`, `pessoas`, `categorias`.
- Os 5 enums: `papel_usuario`, `tipo_unidade`, `tipo_conta_financeira`, `tipo_pessoa`, `tipo_categoria`.
- RLS ligada nas 6 tabelas + a função `SECURITY DEFINER` `empresa_do_usuario()`.
- Seed: 1 empresa (id fixo `00000000-0000-0000-0000-000000000001`, nome "Empreendimento Rios"); 4 unidades (`escritorio`, `espaco`, `chacara`, `emprestimos`); 1 conta financeira ("Conta Principal"); 32 categorias.
- 1 usuário de login no Supabase Auth, com `perfil` ligado à empresa (papel `operador`).

**Não recrie o banco — ele já existe.** Em sprints futuros, ao alterar o schema: gere a migração Drizzle e o humano aplica o SQL via SQL Editor do Supabase (o humano não roda `drizzle-kit migrate` localmente; ele cola SQL no painel).

### Chaves do Supabase — sistema NOVO de chaves

O Supabase deste projeto usa o sistema novo: `sb_publishable_...` (pública, equivale à antiga `anon`) e `sb_secret_...` (secreta, equivale à antiga `service_role`).

O arquivo `.env.local` (não versionado — o humano cria) terá estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=            (URL do projeto Supabase)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(chave sb_publishable_..., usada no cliente)
SUPABASE_SECRET_KEY=                 (chave sb_secret_..., secreta, uso server-side)
DATABASE_URL=                        (pooler de transação, porta 6543 — usado pelo app)
DIRECT_URL=                          (conexão direta, porta 5432 — usado em migrações)
```

Tarefas de ajuste: atualizar `.env.example` para esses nomes; `lib/db/index.ts` usa `DATABASE_URL` com `prepare: false`; `drizzle.config.ts` usa `DIRECT_URL`.

### Decisões de produto — todas fechadas

As 7 decisões da Seção 8 do `TECNICO.md` estão fechadas. Destaques: caixa virtual por negócio + "transferência entre negócios" como lançamento; saldo de abertura modelado como movimentação (não como coluna); principal do empréstimo vence no mês N; quitação antecipada pergunta à dona se cancela ou mantém os juros futuros; sem aviso de taxa de juros.

## Tarefa imediata — terminar o Sprint 0

O Sprint 0 (Seção 7 do `TECNICO.md`) está na metade. A fundação (banco) está pronta. Falta a parte de aplicação:

1. Clientes do Supabase com `@supabase/ssr`: cliente de browser, cliente de servidor (com cookies) e helper de middleware. Usar a publishable key.
2. `middleware.ts` protegendo as rotas autenticadas.
3. Tela de login (e-mail + senha via Supabase Auth) e logout.
4. Layout autenticado com header + **seletor de unidade**. O seletor lista "Todas as Unidades" + as 4 unidades, lidas via Drizzle filtrando pela empresa do perfil do usuário logado.
5. Dashboard placeholder (só a casca, por enquanto).
6. Configurar shadcn/ui corretamente (`components.json`, `lib/utils.ts`, variáveis CSS, e os componentes necessários: button, input, label, select).
7. Rodar `npm install`, `npm run build` e `npm run dev` e validar que tudo compila e roda.

Critério de aceite do Sprint 0: o usuário faz login no sistema e vê as 4 unidades no seletor.

Depois disso: guiar o humano (Mateus, perfil técnico baixo a médio) a subir o projeto para o GitHub e fazer o primeiro deploy na Vercel, com passo a passo explícito.

## Como trabalhar (resumo — detalhe na Seção 8 de cada documento)

- Simplicidade > flexibilidade. Não over-engineer. Seguir convenções de Next.js, shadcn, Drizzle.
- Drizzle para dados; cliente Supabase para auth. RLS é defense-in-depth.
- Toda regra de negócio em `/lib/services`, testável isoladamente.
- UI em português comum. Datas `dd/mm/aaaa`, valores `R$ 1.234,56`. Dinheiro guardado em centavos (`bigint`).
- Construir em sprints, com checkpoint ao fim de cada um. Em dúvida sobre regra de negócio, **perguntar ao humano — não chutar**.
