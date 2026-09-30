# EMPREENDIMENTO RIOS — Documento Técnico (Roteiro de Execução)

> **Como usar este documento.** Este é o *roteiro técnico*. Ele deve ser colado no Claude Code **depois** do documento de negócio (`Empreendimento Rios — Contexto de Negócio`, a "bússola"). Em caso de conflito entre os dois, **a bússola ganha** — porque ela explica o *porquê*. Este aqui explica o *como*.
>
> **Status:** decisões fechadas. As 7 questões da Seção 8 foram resolvidas com o Mateus (ver Seção 8). Pronto para iniciar o Sprint 0.

---

## Seção 1 — Visão Técnica Geral

### 1.1. Objetivo do sistema

Um painel gerencial financeiro web para **uma única dona** que opera **5 negócios** (Escritório, Espaço Esperança, Chácara, Empréstimos, Haras). O sistema responde três perguntas, nesta ordem de importância:

1. "Como está meu mês?" — caixa, lucro, o que entrou e o que saiu.
2. "Quem está me devendo?" — inadimplência, contas a receber atrasadas, empréstimos parados.
3. "Qual negócio rende mais?" — comparação de resultado entre as unidades.

Não é ERP contábil-fiscal. Não substitui o contador externo.

### 1.2. Stack definitivo

| Camada | Tecnologia | Observação |
|---|---|---|
| Framework | Next.js 14+ (App Router) | React, Server Components, Server Actions |
| UI | shadcn/ui + Tailwind CSS | Componentes prontos, sem reinventar |
| Banco de dados | Supabase (PostgreSQL gerenciado) | Hospedagem dos dados é da Supabase |
| ORM / migrations | Drizzle ORM + drizzle-kit | Schema em TypeScript, migrations versionadas |
| Autenticação | Supabase Auth (e-mail + senha) | 1 a 2 usuários (ver Seção 8, item 1) |
| Armazenamento de arquivos | Supabase Storage | Comprovantes (PDF/imagem) |
| Agendamento (jobs) | Vercel Cron | Job diário e job mensal |
| Hospedagem do app | Vercel | Plano grátis cobre o uso esperado |
| Idioma / moeda | Português do Brasil / apenas BRL | Datas `dd/mm/aaaa`, valores `R$ 1.234,56` |

### 1.3. Princípios de arquitetura

Estes espelham a Seção 8 do documento de negócio e valem para **toda** decisão de implementação:

- **Simplicidade > flexibilidade.** Na dúvida, a solução mais simples. Dá para refatorar depois.
- **Menos informação na tela > mais.** Na dúvida, esconder. Tela limpa.
- **Convenção > invenção.** Padrões do Next.js, do shadcn, do Drizzle. Não criar abstração genérica para "caso futuro".
- **Não over-engineer.** É o sistema de 5 negócios de uma pessoa, não um produto SaaS.
- **Regra de negócio não se chuta.** Se faltar contexto, perguntar ao Mateus antes de codar.

### 1.4. Ambiente e divisão de responsabilidades

O sistema roda em nuvem: dados no Supabase, app na Vercel. A dona acessa pelo navegador (desktop e celular — web responsivo, não app nativo).

**O que o Claude Code faz:** escreve 100% do código (schema, migrations, backend, telas), roda e testa localmente.

**O que o Mateus faz** (passo a passo entregue no Sprint 0): cria a conta e o projeto no Supabase; cria o projeto na Vercel; configura as variáveis de ambiente; roda as migrations contra o Supabase real; aciona o deploy. Nenhuma dessas etapas exige escrever código — são cliques e cópia de chaves.

---

## Seção 2 — Arquitetura da Aplicação

### 2.1. Estrutura de pastas

```
/app
  /(auth)/login            → tela de login
  /(app)                   → área autenticada (layout com header + seletor de unidade)
    /dashboard
    /movimentacoes
    /contas-a-pagar
    /contas-a-receber
    /emprestimos
    /reservas
    /contratos
    /pessoas
    /contas-financeiras
    /categorias
    /unidades
    /alertas
  /api/cron/diario         → endpoint do job diário
  /api/cron/mensal         → endpoint do job mensal
/components
  /ui                      → shadcn (gerado, não editar à mão)
  /<dominio>               → componentes de negócio (forms, tabelas, modais)
/lib
  /db                      → schema Drizzle, client, migrations
  /supabase                → clients (server, browser, middleware)
  /services                → lógica de negócio (empréstimo, recorrência, baixa, saldo)
  /utils                   → formatação BR (moeda, data), helpers
/drizzle                   → migrations geradas pelo drizzle-kit
middleware.ts              → proteção de rotas
```

### 2.2. Camadas

Fluxo de uma ação (ex.: dar baixa numa conta):

`Tela (shadcn form)` → `Server Action` → `Service em /lib/services` → `Drizzle` → `Postgres (Supabase)`

- **Telas** só cuidam de exibição e captura. Não contêm regra de negócio.
- **Server Actions** são o ponto de entrada das mutações. Validam input (Zod) e chamam o service.
- **Services** concentram a regra de negócio. É onde mora a lógica de empréstimo, baixa, saldo. Testável isoladamente.
- **Drizzle** é a única forma de tocar o banco. Sem SQL solto espalhado.

Regra: **toda lógica financeira fica em `/lib/services`**, nunca dentro de um componente de tela. Isso existe para que o módulo de empréstimo — o mais sensível — seja testável e auditável num lugar só.

### 2.3. Autenticação e RLS

- Supabase Auth com e-mail/senha. Sem cadastro público — os usuários são criados manualmente.
- Tabela `perfis` liga cada usuário do `auth.users` a uma `empresa_id` e a um papel (`dona` ou `operador`).
- **RLS (Row Level Security) ligado em todas as tabelas**, filtrando por `empresa_id`. Como só existe uma empresa hoje, na prática isola pouca coisa — mas é barato, é o padrão Supabase e o documento de negócio (3.1) pede explicitamente.
- O filtro por **unidade** (`unidade_id`) **não** é segurança — é só visão gerencial. Roda no app, não na RLS.
- `middleware.ts` redireciona quem não está logado para `/login`.

### 2.4. Convenções de código

- Nomes de tabelas e colunas em **português, snake_case** (`contas_a_receber`, `data_vencimento`). Alinha com o vocabulário do negócio e do glossário.
- Dinheiro é armazenado como **inteiro em centavos** (`bigint`) — nunca `float`. Formatação para `R$` só na exibição. Isso elimina erro de arredondamento, que num sistema financeiro é inaceitável.
- Datas sem hora (vencimento, competência, caixa) são `date`. Datas com hora são `timestamptz`.
- Toda mutação relevante registra `created_at`; registros editáveis registram `updated_at`.
- Justificar em **1 frase** (comentário) qualquer decisão não óbvia. Sem ensaios.

---

## Seção 3 — Modelo de Dados

### 3.1. Visão geral

Quatorze tabelas. O núcleo financeiro são `movimentacoes` (o que aconteceu de fato) e `contas_a_pagar` / `contas_a_receber` (o que está previsto). Tudo gira em torno disso.

```
empresas ─┬─ perfis (usuários)
          ├─ unidades_negocio ─┬─ categorias
          │                    ├─ imoveis ── reservas
          │                    └─ emprestimos ── emprestimo_parcelas
          ├─ contas_financeiras
          ├─ pessoas
          ├─ recorrencias
          ├─ contas_a_pagar  ─┐
          ├─ contas_a_receber ─┼─ (baixa gera) ── movimentacoes
          └─ movimentacoes ────┘
```

### 3.2. Enums

| Enum | Valores |
|---|---|
| `tipo_unidade` | `escritorio`, `espaco`, `chacara`, `emprestimos`, `haras` |
| `tipo_categoria` | `receita`, `despesa`, `movimentacao_patrimonial` |
| `tipo_movimentacao` | `entrada`, `saida` |
| `tipo_conta_financeira` | `conta_corrente`, `caixa_fisico`, `aplicacao`, `outro` |
| `status_conta` | `pendente`, `pago`, `atrasado`, `cancelado` |
| `status_emprestimo` | `ativo`, `inadimplente`, `quitado`, `cancelado` |
| `tipo_parcela` | `juros`, `principal` |
| `status_parcela` | `pendente`, `pago`, `atrasado`, `cancelado` |
| `tipo_imovel` | `salao`, `chacara` |
| `status_reserva` | `confirmada`, `concluida`, `cancelada` |
| `papel_usuario` | `dona`, `operador` |

### 3.3. Tabelas

**`empresas`** — raiz de isolamento. Uma linha hoje.
`id`, `nome`, `created_at`.

**`perfis`** — liga usuário do Supabase Auth à empresa.
`id` (= `auth.users.id`), `empresa_id`, `nome`, `papel` (`papel_usuario`), `created_at`.

**`unidades_negocio`** — os negócios da dona.
`id`, `empresa_id`, `nome`, `tipo` (`tipo_unidade`), `ativo` (bool), `created_at`.
Seed inicial cria 4: Escritório, Espaço Esperança, Chácara, Empréstimos. O tipo `haras` é aceito pelo enum mas nenhuma unidade haras é criada agora.

**`contas_financeiras`** — as "carteiras" (Itaú PJ, Caixa Físico, aplicação...).
`id`, `empresa_id`, `nome`, `tipo` (`tipo_conta_financeira`), `ativo` (bool), `created_at`.
Não pertencem a uma unidade — são compartilhadas entre os negócios. Não têm coluna de saldo inicial: o saldo de abertura entra como **movimentações de abertura** (ver 3.4, decisão 6, e 4.2).

**`pessoas`** — cadastro único. Cliente, fornecedor, hóspede e tomador são a **mesma tabela**. O papel é derivado do uso, não armazenado.
`id`, `empresa_id`, `nome`, `tipo_pessoa` (`fisica`/`juridica`), `documento` (CPF/CNPJ, opcional), `telefone`, `email`, `observacoes`, `created_at`.

**`categorias`** — plano de contas dinâmico, **por unidade**.
`id`, `empresa_id`, `unidade_id`, `nome`, `tipo` (`tipo_categoria`), `ativo` (bool), `created_at`.
Seed inicial por unidade (ver 3.5).

**`movimentacoes`** — o lançamento financeiro **real**. Dinheiro que entrou ou saiu de fato. É a fonte do Fluxo de Caixa e dos saldos.
`id`, `empresa_id`, `unidade_id`, `conta_financeira_id`, `categoria_id`, `pessoa_id` (opcional), `tipo` (`tipo_movimentacao`), `valor` (centavos, sempre positivo), `data_competencia` (date), `data_caixa` (date), `descricao`, `comprovante_url` (opcional), `origem_conta_pagar_id` (opcional), `origem_conta_receber_id` (opcional), `origem_parcela_id` (opcional), `transferencia_par_id` (opcional, self-FK), `created_at`, `updated_at`.
Os campos `origem_*` registram de qual conta/parcela esta movimentação nasceu (rastreabilidade da baixa). `transferencia_par_id` liga as duas pernas de uma transferência entre contas.

**`contas_a_pagar`** — despesa prevista, ainda não paga (visão de competência).
`id`, `empresa_id`, `unidade_id`, `categoria_id`, `pessoa_id` (opcional), `descricao`, `valor` (centavos), `data_vencimento` (date), `status` (`status_conta`), `data_baixa` (date, opcional), `movimentacao_id` (opcional — preenchido na baixa), `recorrencia_id` (opcional — se nasceu de recorrência), `comprovante_url` (opcional), `created_at`, `updated_at`.

**`contas_a_receber`** — receita prevista, ainda não recebida.
Mesmas colunas de `contas_a_pagar`, mais `reserva_id` (opcional — se nasceu de uma reserva). Não tem `origem_parcela_id`: parcelas de empréstimo vivem em tabela própria (ver 3.4).

**`recorrencias`** — regra que gera contas a pagar/receber todo mês. Cobre também os **Contratos** do escritório (ver 3.4).
`id`, `empresa_id`, `unidade_id`, `tipo` (`pagar`/`receber`), `categoria_id`, `pessoa_id` (opcional), `descricao`, `valor` (centavos), `dia_vencimento` (1–31), `data_inicio` (date), `data_fim` (date, opcional), `ativo` (bool), `created_at`, `updated_at`.

**`emprestimos`** — a operação de crédito. Cabeçalho do empréstimo.
`id`, `empresa_id`, `unidade_id` (a unidade Empréstimos), `pessoa_id` (o tomador), `conta_financeira_id` (de onde saiu o capital), `valor_principal` (centavos), `taxa_juros_mensal` (decimal, ex.: `0.0500` = 5%), `prazo_meses` (int), `data_inicio` (date), `status` (`status_emprestimo`), `observacoes`, `created_at`, `updated_at`.

**`emprestimo_parcelas`** — cada cobrança individual do empréstimo (N de juros + 1 de principal).
`id`, `emprestimo_id`, `numero` (int), `tipo` (`tipo_parcela`), `valor` (centavos), `data_vencimento` (date), `status` (`status_parcela`), `data_baixa` (date, opcional), `movimentacao_id` (opcional).

**`imoveis`** — propriedades que se reservam (o salão; uma ou mais chácaras).
`id`, `empresa_id`, `unidade_id`, `nome`, `tipo` (`tipo_imovel`), `ativo` (bool), `created_at`.
Seed inicial: 1 salão (unidade Espaço) e 1 chácara (unidade Chácara). O modelo já suporta várias chácaras.

**`reservas`** — agendamento de uso de um imóvel.
`id`, `empresa_id`, `unidade_id`, `imovel_id`, `pessoa_id`, `descricao` (ex.: "Casamento Carlos"), `data_inicio` (date), `data_fim` (date), `valor_total` (centavos), `status` (`status_reserva`), `observacoes`, `created_at`, `updated_at`.

### 3.4. Decisões de modelagem não óbvias

Estas são escolhas que precisam de aprovação do Mateus (repetidas na Seção 8):

1. **`emprestimo_parcelas` é tabela separada, não vira `contas_a_receber`.** Motivo: o módulo de empréstimo é o mais sensível do sistema e o bug original nasceu justamente de tratar errado o que é juros e o que é principal. Mantê-lo explícito e isolado reduz risco. **Consequência:** a tela "Contas a Receber" e o Painel de Alertas precisam ler *duas* fontes (contas a receber + parcelas pendentes). Resolvido com uma **VIEW** Postgres `vw_recebiveis` que unifica as duas em um formato só. Escrita explícita, leitura simples.

2. **Não existe tabela `contratos`.** Um "Contrato" do escritório é uma `recorrencia` de `tipo = receber` com `pessoa_id` preenchido. A tela "Contratos" é a tela de recorrências filtrada. Menos uma tabela, mesma função.

3. **Um comprovante por registro** (`comprovante_url` como coluna, não tabela de anexos). Se no futuro precisar de vários anexos, refatora. Hoje seria over-engineering.

4. **Papéis de pessoa são derivados, não armazenados.** "Quem são meus clientes" sai de uma consulta (quem tem conta a receber / contrato / reserva). "Quem são meus tomadores" sai de `emprestimos`. Sem tabela de papéis.

5. **Exclusão é física (hard delete) com confirmação.** Apagar uma movimentação que era baixa de uma conta **reverte** a conta para `pendente` e recalcula o saldo. Soft delete fica como melhoria futura, se a dona sentir falta de "lixeira".

6. **Saldo de abertura é uma movimentação, não uma coluna.** Em vez de guardar `saldo_inicial` na conta financeira, o dinheiro que a dona já tem ao iniciar o sistema é lançado como **movimentações de abertura** (categoria `Saldo Inicial`, tipo `movimentacao_patrimonial`), uma por par conta × negócio. Motivo: com o caixa por negócio (Seção 8, item 7), o saldo inicial precisa ser atribuído a um negócio — modelá-lo como movimentação resolve isso e deixa o cálculo de saldo com **uma única fórmula** (soma de movimentações), sem caso especial.

### 3.5. Seeds iniciais

Ao subir o banco, criar: 1 empresa; 4 unidades (Escritório, Espaço Esperança, Chácara, Empréstimos); 1 conta financeira exemplo; 1 imóvel salão + 1 imóvel chácara; e as categorias padrão por unidade:

- **Escritório:** Honorários Tributários, Honorários Jurídicos, Mensalidade Contábil *(receita)*; Aluguel do Escritório, Material de Escritório, Energia, Água, Internet, Comissão de Parceiro *(despesa)*.
- **Espaço Esperança:** Locação de Espaço, Buffet *(receita)*; Manutenção, Energia, Água, Jardinagem, Reforma *(despesa)*.
- **Chácara:** Diárias, Taxa de Limpeza *(receita)*; Manutenção Chácara, Energia, Água, Jardinagem, Caseiro *(despesa)*.
- **Empréstimos:** Juros Recebidos *(receita)*; Custos Operacionais *(despesa)*; Capital Emprestado, Retorno de Capital *(movimentacao_patrimonial)*.
- **Transversais** (valem para qualquer unidade): Aporte do Dono, Retirada do Dono, Transferência entre Contas, Transferência entre Negócios, Saldo Inicial *(todas `movimentacao_patrimonial`)*.

A dona pode criar, renomear e desativar categorias depois — o seed é só o ponto de partida.

---

## Seção 4 — Lógica de Negócio Crítica

> Toda a lógica desta seção mora em `/lib/services`. É o coração do sistema.

### 4.1. Movimentação e baixa de contas

Uma **movimentação** é dinheiro que mexeu de verdade. Pode nascer de três jeitos:

1. **Lançamento direto** — a dona registra uma entrada/saída avulsa. Cria só a movimentação.
2. **Baixa de uma conta a pagar/receber** — a dona marca a conta como paga. O sistema: cria a movimentação realizada; preenche `movimentacao_id` e `data_baixa` na conta; muda `status` para `pago`. A movimentação herda unidade, categoria, pessoa e valor da conta.
3. **Baixa de uma parcela de empréstimo** — igual, mas a partir de `emprestimo_parcelas` (ver 4.4).

**Estorno:** apagar a movimentação de uma baixa volta a conta/parcela para `pendente` e zera `data_baixa`/`movimentacao_id`.

### 4.2. Cálculo de saldos

Todo saldo é uma soma de movimentações — não há coluna de saldo. Uma única fórmula, três recortes do mesmo dinheiro:

- **Saldo de uma conta financeira** = Σ(`entrada`) − Σ(`saida`) das movimentações daquela conta. Inclui as movimentações de abertura.
- **Caixa de um negócio** = Σ(`entrada`) − Σ(`saida`) das movimentações daquele `unidade_id`. É o "caixa virtual por negócio" (Seção 8, item 7): o dinheiro continua nas contas bancárias compartilhadas; este número diz quanto do total pertence, gerencialmente, àquele negócio.
- **Saldo Global** = Σ de todas as movimentações = Σ dos saldos de conta = Σ dos caixas de negócio. As três visões fecham no mesmo total.
- **Transferência** = duas movimentações ligadas por `transferencia_par_id`: uma `saida` e uma `entrada`. Pode mover dinheiro **entre contas** (categoria "Transferência entre Contas"), **entre negócios** (categoria "Transferência entre Negócios" — sai do caixa de um `unidade_id`, entra no de outro) ou ambos ao mesmo tempo. Nunca afeta o Saldo Global; só redistribui. **Mover dinheiro de um negócio para outro sem registrar a transferência faz o caixa por negócio mentir** — por isso a transferência entre negócios é um lançamento de primeira classe.

### 4.3. DRE gerencial / Lucro Líquido

Regime de **caixa** (3.2 do briefing). Para um período e uma unidade (ou consolidado):

- **Receitas realizadas** = Σ movimentações `entrada` cuja `categoria.tipo = receita`, por `data_caixa` no período.
- **Despesas realizadas** = Σ movimentações `saida` cuja `categoria.tipo = despesa`, por `data_caixa` no período.
- **Lucro Líquido** = Receitas realizadas − Despesas realizadas.
- **`movimentacao_patrimonial` fica de fora do cálculo de lucro.** Capital emprestado, retorno de capital, aporte, retirada e transferência aparecem no Fluxo de Caixa (o dinheiro mexeu), mas **não** entram no DRE. Esta é a regra que conserta o bug do protótipo.

### 4.4. Empréstimos

**Criação** (Cenário 3 do briefing). Dados `P` (principal), `T` (taxa mensal), `N` (prazo), `data_inicio`:

1. Cria `emprestimos` com `status = ativo`.
2. Gera `N` parcelas `tipo = juros`, valor = `P × T` cada, `numero` 1..N, vencimento = `data_inicio + numero` meses.
3. Gera 1 parcela `tipo = principal`, valor = `P`, `numero = N+1`, vencimento = `data_inicio + N` meses — **junto da última parcela de juros** (Seção 8, item 2). O empréstimo dura N meses.
4. Cria uma movimentação de **saída** de `P`, categoria "Capital Emprestado" (`movimentacao_patrimonial`), na `conta_financeira_id` do empréstimo. **Sai do caixa, não conta como despesa.**

**Baixa de parcela de juros:** cria movimentação de `entrada`, categoria "Juros Recebidos" (`receita`). **Entra no DRE.**

**Baixa da parcela de principal:** cria movimentação de `entrada`, categoria "Retorno de Capital" (`movimentacao_patrimonial`). **Não entra no DRE.** Quando esta parcela é baixada e não há mais parcelas pendentes, `emprestimo.status = quitado`.

**Quitação antecipada:** a dona quita o empréstimo no mês `k < N`. O sistema **pergunta à dona** o que fazer com os juros dos meses restantes (Seção 8, item 3): *cancelar* — as parcelas de juros não vencidas (`numero > k`, `status = pendente`) viram `cancelado`; ou *manter a cobrança* — elas continuam `pendente` e devidas. Nos dois casos: parcelas de juros já vencidas e não pagas continuam devidas; a parcela de principal é baixada agora; o empréstimo vira `quitado`.

**Inadimplência:** ver 4.7.

**Taxa de juros:** sem aviso e sem validação. O sistema aceita qualquer taxa e não fiscaliza legalidade (Seção 8, item 4) — não é função do sistema.

### 4.5. Recorrências

Cada `recorrencia` ativa gera, uma vez por mês, uma `conta_a_pagar` ou `conta_a_receber` para o mês seguinte, com vencimento no `dia_vencimento`. O job mensal (5.2) faz isso. Regras: não gerar antes de `data_inicio` nem depois de `data_fim`; não duplicar (se a conta daquele mês já existe para aquela recorrência, pular); se `dia_vencimento` não existe no mês (ex.: 31 em fevereiro), usar o último dia do mês.

### 4.6. Reservas

**Conflito de datas:** ao criar/editar uma reserva `confirmada`, rejeitar se já existir outra reserva `confirmada` no **mesmo `imovel_id`** com intervalo `[data_inicio, data_fim]` sobreposto. A checagem é por imóvel — duas chácaras diferentes podem ter reservas no mesmo dia.

**Geração financeira** (Cenário 2): ao confirmar uma reserva, gerar contas a receber conforme o combinado — tipicamente duas: o **sinal** (vencimento próximo) e o **restante** (vencimento na data do evento). As duas ficam ligadas à reserva por `reserva_id`. O valor e a divisão são informados pela dona no cadastro da reserva.

**Cancelamento:** ao cancelar (`status = cancelada`), as contas a receber ligadas e ainda `pendente`/`atrasado` são canceladas. O sinal já recebido é situação delicada (pode ser retido ou devolvido) — o sistema **não** decide sozinho: pergunta à dona, no momento do cancelamento, se o sinal foi retido (a movimentação já existente permanece) ou devolvido (gera uma movimentação de `saida`). Ver Seção 8, item 5.

### 4.7. Inadimplência e alertas

O job diário (5.1) marca como `atrasado` toda `conta_a_pagar`, `conta_a_receber` e `emprestimo_parcela` com `data_vencimento < hoje` e `status = pendente`. Se um empréstimo tem ao menos uma parcela `atrasado`, seu `status` vira `inadimplente`. Quando a última parcela é quitada, vira `quitado`.

O **Painel de Alertas** lista, em vermelho forte: contas a receber atrasadas (quem deve, quanto, há quantos dias), empréstimos inadimplentes, e contas a pagar vencidas. É a tela que materializa o "inadimplência é trauma" do briefing.

---

## Seção 5 — Jobs e Automação

### 5.1. Job diário — `/api/cron/diario`

Roda 1×/dia (sugestão: 06:00). Marca contas e parcelas vencidas como `atrasado`; atualiza status de empréstimos para `inadimplente`. Idempotente — rodar duas vezes no mesmo dia não causa efeito duplicado.

### 5.2. Job mensal — `/api/cron/mensal`

Roda 1×/mês (sugestão: dia 1, 05:00). Para cada recorrência ativa, gera a conta a pagar/receber do mês. Idempotente — não duplica conta já gerada.

### 5.3. Agendamento

Via **Vercel Cron** (configurado em `vercel.json`). Cada endpoint é protegido por um header secreto (`CRON_SECRET`) — só executa se o segredo bater, para ninguém disparar o job de fora. Os endpoints também podem ser acionados manualmente pela dona num botão "rodar agora" escondido em configurações, como rede de segurança.

---

## Seção 6 — Telas e UX

### 6.1. Layout global

Header fixo com: nome do sistema, **seletor de unidade** (o coração da navegação — "Todas as Unidades" = consolidado; uma específica = só ela) e menu do usuário. Menu lateral com as telas. O seletor de unidade filtra **tudo** que está abaixo dele.

### 6.2. Lista de telas

| Tela | Função |
|---|---|
| Dashboard | "Como está meu mês": Saldo Global, caixa por negócio, Receita/Despesa/Lucro do mês, gráfico de barras comparando unidades, atalho para alertas |
| Fluxo de Caixa (Movimentações) | Lista de tudo que entrou e saiu; filtros por período, unidade, conta, categoria |
| Contas a Pagar | Despesas previstas; botão de baixa |
| Contas a Receber | Receitas previstas (inclui parcelas de empréstimo via `vw_recebiveis`); botão de baixa |
| Empréstimos | Lista de empréstimos, totais (emprestado, atrasado, juros previstos no mês), detalhe com as parcelas |
| Reservas | Calendário/lista por imóvel; criação com checagem de conflito |
| Contratos | Recorrências de receita vinculadas a pessoas (escritório) |
| Pessoas | Cadastro único |
| Contas Financeiras | Carteiras e seus saldos; cadastro do saldo de abertura (por conta × negócio) na entrada do sistema |
| Categorias | Plano de contas por unidade |
| Unidades | Cadastro das unidades de negócio |
| Painel de Alertas | Inadimplência e vencimentos, em vermelho |

### 6.3. Padrões de UI

- **Cadastro = modal**, não tela cheia. Campos mínimos. Defaults: data = hoje, status = pendente, unidade = a selecionada no header.
- **Editar e Excluir** (com confirmação) em quase tudo. A dona vai errar lançamento.
- **Nunca esconder dinheiro:** se entrou ou saiu, aparece no Fluxo de Caixa — mesmo sendo `movimentacao_patrimonial`. O que muda é só se entra no cálculo de lucro.
- **Formato BR:** datas `dd/mm/aaaa`; valores `R$ 1.234,56` (milhar com ponto, decimal com vírgula).
- **Inadimplência em vermelho forte.** Sem eufemismo.
- **Comprovante** é opcional, mas o botão de anexar está sempre presente (PDF/imagem → Supabase Storage).
- Linguagem em **português comum**, não contabilês. "Dinheiro que entrou", não "crédito".

---

## Seção 7 — Plano de Sprints

> Cada sprint termina num **checkpoint**: algo que a dona (ou o Mateus) consegue testar e aprovar antes de seguir. Nenhum sprint começa antes do anterior ser aceito.

### Sprint 0 — Fundação e Deploy

**Objetivo:** projeto no ar, vazio, com login funcionando.
**Entregáveis:** repositório Next.js + shadcn + Drizzle configurados; projeto Supabase; schema das tabelas-base (`empresas`, `perfis`, `unidades_negocio`, `contas_financeiras`, `pessoas`, `categorias`) + seeds; RLS ligado; tela de login; layout com header e seletor de unidade (ainda sem dados); deploy na Vercel.
**Ao fim, a dona consegue:** entrar no sistema e ver a casca, com as 4 unidades no seletor.
**O que o Mateus faz:** criar conta/projeto Supabase; criar projeto Vercel; copiar as chaves para as variáveis de ambiente; rodar as migrations; criar o usuário da dona. *(Passo a passo detalhado entregue junto deste sprint.)*
**Checkpoint:** login funciona em produção; seletor de unidade lista as 4 unidades.

### Sprint 1 — Núcleo Financeiro

**Objetivo:** registrar dinheiro entrando e saindo, com caixa por conta e por negócio.
**Entregáveis:** tabela `movimentacoes`; CRUD de movimentações; CRUD de contas financeiras e categorias; movimentações de abertura (saldo inicial por conta × negócio); transferência (entre contas e entre negócios); tela Fluxo de Caixa com filtros; cálculo de saldo por conta, caixa por negócio e Saldo Global; Dashboard mínimo (Saldo Global, caixa por negócio, Receita/Despesa/Lucro do mês).
**Ao fim, a dona consegue:** lançar qualquer entrada/saída, transferir dinheiro entre negócios e ver o caixa de cada negócio correto.
**O que o Mateus faz:** testar com lançamentos reais de um mês; validar que saldo por conta, caixa por negócio e Saldo Global fecham no mesmo total.
**Checkpoint:** lançar 10 movimentações variadas + 1 transferência entre negócios; as três visões de saldo fecham com a conta na mão.

### Sprint 2 — Contas a Pagar e a Receber

**Objetivo:** a visão do que está previsto.
**Entregáveis:** tabelas `contas_a_pagar` e `contas_a_receber`; CRUD; fluxo de **baixa** (conta → movimentação, atualiza saldo); telas das duas; anexo de comprovante.
**Ao fim, a dona consegue:** cadastrar uma despesa/receita futura e dar baixa quando o dinheiro mexer.
**O que o Mateus faz:** testar baixa e estorno; conferir se o estorno volta a conta para pendente.
**Checkpoint:** Cenário 5 do briefing (despesa) e a parte de baixa do Cenário 1 funcionam ponta a ponta.

### Sprint 3 — Recorrências e Contratos

**Objetivo:** parar de digitar aluguel e mensalidade todo mês.
**Entregáveis:** tabela `recorrencias`; CRUD; job mensal (`/api/cron/mensal`) + Vercel Cron; tela Contratos.
**Ao fim, a dona consegue:** cadastrar o contrato de R$ 1.200/mês do João e o aluguel do escritório uma vez só.
**O que o Mateus faz:** rodar o job manualmente e conferir que as contas do mês seguinte aparecem sem duplicar.
**Checkpoint:** Cenário 1 (mensalidade) e Cenário 5 (recorrência de despesa) completos.

### Sprint 4 — Empréstimos *(módulo mais sensível)*

**Objetivo:** a operação de crédito, com a contabilidade correta.
**Entregáveis:** tabelas `emprestimos` e `emprestimo_parcelas`; criação com geração de parcelas; baixa de juros (receita) e de principal (retorno de capital); quitação antecipada; VIEW `vw_recebiveis`; tela de empréstimos com totais; aviso de taxa alta.
**Ao fim, a dona consegue:** registrar um empréstimo e ver juros entrando como lucro e principal voltando sem virar lucro.
**O que o Mateus faz:** validar com Cenário 3 — emprestar 30k a 5%/12m e conferir que o DRE mostra lucro de juros, não prejuízo de 30k.
**Checkpoint:** Cenário 3 fecha; o bug do protótipo (capital como despesa) comprovadamente não existe.

### Sprint 5 — Reservas

**Objetivo:** agendar uso do Espaço e da Chácara sem conflito.
**Entregáveis:** tabelas `imoveis` e `reservas`; CRUD; checagem de conflito de datas; geração de sinal + restante como contas a receber; fluxo de cancelamento.
**Ao fim, a dona consegue:** confirmar uma reserva e ver as duas cobranças aparecerem em Contas a Receber.
**O que o Mateus faz:** testar conflito (tentar reservar o mesmo imóvel/dia duas vezes) e cancelamento.
**Checkpoint:** Cenário 2 fecha; sistema recusa data sobreposta no mesmo imóvel.

### Sprint 6 — Dashboard, Alertas e Inadimplência

**Objetivo:** as respostas rápidas que a dona mais quer.
**Entregáveis:** Dashboard completo (gráfico comparando unidades, lucro do mês legível em 2s); Painel de Alertas; job diário (`/api/cron/diario`) + Vercel Cron marcando atrasados/inadimplentes.
**Ao fim, a dona consegue:** abrir o sistema e, em segundos, ver como está o mês e quem está devendo.
**O que o Mateus faz:** validar Cenário 4 (inadimplência) e Cenário 6 (visão consolidada).
**Checkpoint:** Cenários 4 e 6 fecham.

### Sprint 7 — Polimento

**Objetivo:** tirar as asperezas antes de entregar para uso diário.
**Entregáveis:** revisão de responsividade (celular); estados vazios; mensagens de erro claras; revisão de formatação BR; confirmação de edição/exclusão em tudo; ajustes de UX a partir do uso real.
**Checkpoint:** a dona usa o sistema por uma semana sem travar.

### Sprint Haras *(futuro — fora do escopo inicial)*

Só depois de tudo acima em produção. Painel de animais, sócios (N:N), reprodução, veterinários, estoque, vendas/compras. O financeiro do haras já usará o módulo central — por isso `unidades_negocio` já aceita `haras` e a arquitetura financeira já é genérica. **Não construir agora.**

---

## Seção 8 — Decisões Fechadas

As 7 questões foram resolvidas com o Mateus. Esta seção é a fonte de verdade dessas decisões:

1. **Usuários.** Apenas a dona e o Mateus (papel `operador`). E-mail/senha, sem cadastro público.
2. **Vencimento do principal.** A parcela de principal vence no **mês N**, junto da última parcela de juros. O empréstimo dura N meses.
3. **Quitação antecipada.** O sistema **pergunta à dona**, no momento da quitação, se os juros dos meses restantes são *cancelados* ou *mantidos como cobrança*. Decisão caso a caso.
4. **Aviso de taxa de juros: removido.** O sistema não exibe aviso de taxa alta, não valida legalidade e não fiscaliza nada — aceita qualquer taxa. O propósito do sistema é organizar, não fiscalizar.
5. **Sinal em cancelamento de reserva.** No cancelamento, o sistema pergunta à dona se o sinal foi *retido* (permanece como receita) ou *devolvido* (gera uma movimentação de saída de caixa).
6. **Decisões de modelagem (Seção 3.4) confirmadas:** contrato é uma recorrência (sem tabela própria); empréstimo tem tabela de parcelas separada; um comprovante por registro; exclusão física com confirmação. A isto soma-se a decisão 6 da Seção 3.4 (saldo de abertura como movimentação), consequência do item 7.
7. **Caixa por negócio.** A dona quer ver o **caixa de cada negócio**, não só o resultado (DRE). Implementado como **caixa virtual**: o dinheiro continua nas contas bancárias compartilhadas e o sistema calcula quanto pertence a cada negócio (Seção 4.2). Exige que mover dinheiro entre negócios seja registrado como **transferência entre negócios**. O saldo de abertura é alocado por negócio na entrada do sistema. Custo aceito conscientemente: a dona ganha um lançamento novo a fazer sempre que mover dinheiro entre negócios.

---

## Seção 9 — Definition of Done

Uma funcionalidade só está pronta quando: a regra de negócio correspondente está em `/lib/services` e testada; a tela usa modal para cadastro, com defaults; editar e excluir funcionam com confirmação; valores e datas estão em formato BR; o cenário do briefing relacionado passa ponta a ponta; e a RLS está ativa na(s) tabela(s) tocada(s).

**Regra de ouro:** em conflito entre este documento e o de negócio, o de negócio vence. Em dúvida de regra de negócio, perguntar — não chutar.
