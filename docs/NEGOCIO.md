# Empreendimento Rios — Contexto de Negócio

> Este é o briefing de negócio — a "bússola". Explica o *porquê* de tudo. O documento técnico (`TECNICO.md`) é o roteiro de execução. Em caso de conflito entre os dois, **este aqui ganha**, porque ele explica a intenção.

## 1. Quem é a cliente

A cliente — referida como "a dona" — é uma empreendedora brasileira que opera múltiplos negócios sob gestão única. Não é uma corporação. Não é uma startup. É uma pessoa real, tocando 5 frentes ao mesmo tempo, geralmente sem time dedicado de gestão financeira, sem ERP, sem contador interno full-time.

Perfil técnico dela: baixo a médio. Usa planilhas, WhatsApp, conhece bancos digitais. Não vai usar SQL, não vai escrever fórmula complexa. Quer tela limpa, botões claros, números que façam sentido sem precisar de explicação.

Por que ela precisa do sistema: hoje ela controla os 5 negócios em cabeça, papel e planilhas soltas. Toma decisões no escuro: não sabe qual negócio dá mais lucro, não sabe quem está devendo, esquece vencimento de empréstimo concedido, mistura dinheiro de um negócio com outro. O sistema é o painel gerencial dela, não um ERP contábil. O contador da empresa é externo e usa outras ferramentas — esse sistema não substitui contabilidade fiscal.

Implicação para a construção: **simplicidade > completude**. Se uma feature acrescenta poder mas exige treinamento, ela não vai usar. Prefira sempre o caminho de menor fricção. UI direta. Linguagem em português comum, não contabilês.

## 2. Os 5 negócios

### 2.1. Escritório Contábil/Jurídico

Prestação de serviços profissionais. Honorários recorrentes de clientes (mensalidades de contabilidade) e honorários eventuais (consultoria jurídica, processos pontuais).

Entradas: mensalidades fixas (ex.: cliente X paga R$ 1.200/mês todo dia 10); honorários avulsos por serviço (consultoria jurídica, abertura de empresa, defesas).

Saídas: aluguel do escritório; material de escritório, energia, água, internet; eventualmente comissão de parceiro ou freelancer.

Particularidades: tem clientes recorrentes (contrato mensal) e clientes pontuais (one-off). A inadimplência aqui é comum — cliente atrasa mensalidade mas continua sendo atendido; precisa visualizar quem está em atraso. O sistema gere a relação financeira ENTRE a dona e os clientes do escritório, não a contabilidade dos clientes em si.

Fora do escopo: apuração de impostos dos clientes; trânsito de DARF/guias; emissão de nota fiscal.

### 2.2. Espaço Esperança

Salão/espaço alugado para eventos sociais — casamentos, aniversários, formaturas, eventos corporativos.

Entradas: locação do espaço (valor por evento, normalmente em duas parcelas: sinal + restante); eventualmente buffet e decoração próprios.

Saídas: manutenção do imóvel; energia, água, jardinagem; reformas pontuais.

Particularidades: eventos são agendados com antecedência (reserva confirmada hoje para evento daqui a 6 meses). Sinal (geralmente 30-50% do valor) entra primeiro, restante no dia do evento ou próximo. Datas não podem se sobrepor. Cancelamento de evento confirmado é situação delicada: o sinal pode ser retido ou devolvido.

### 2.3. Chácara de Aluguel

Propriedade rural alugada por diárias para lazer — finais de semana, feriados, retiros pequenos.

Entradas: diárias (R$ X por dia, com mínimo de 1 ou 2 diárias); taxa de limpeza adicional em alguns casos.

Saídas: manutenção (piscina, gramado, estrutura); energia, água; caseiro (eventualmente); jardinagem.

Particularidades: pode existir mais de uma chácara no futuro (o sistema deve suportar múltiplos imóveis do mesmo tipo). Mesmo problema de sobreposição de datas. Hóspedes frequentemente são pessoas físicas conhecidas — clientes recorrentes.

### 2.4. Operação de Empréstimos

O módulo mais sensível do sistema. A dona empresta dinheiro próprio para terceiros, recebendo juros mensais. É operação informal de mútuo civil — não é instituição financeira, não tem autorização do BACEN.

Modelo de juros (modelo A1, juros simples): empresta valor P (ex.: R$ 30.000) com taxa T (ex.: 5% ao mês) por N meses (ex.: 12). O tomador paga P×T de juros todo mês durante N meses. No vencimento, devolve os P de principal. Total recebido: N×(P×T) de juros + P de principal. Lucro real da operação = só os juros.

Regra contábil-gerencial crítica: quando o dinheiro SAI do caixa para emprestar, **não é despesa** — é movimentação patrimonial (virou um direito a receber). Quando o JUROS entra, é **receita** (vai ao DRE). Quando o PRINCIPAL volta, **não é receita** — é retorno de capital. Erro comum: tratar capital emprestado como despesa; faz o sistema dizer que a operação dá prejuízo. Esse bug existiu no protótipo inicial e foi o motivo de redesenhar o módulo.

Particularidades: inadimplência é parte do negócio. A dona quer ver claramente quanto está emprestado no total, quanto está atrasado e quanto deveria entrar de juros no mês. Empréstimo pode ser quitado antecipadamente. Modelos A2 (juros compostos) e A3 (juros com multa/mora) foram descartados para simplificar.

### 2.5. Haras

Propriedade rural com criação, reprodução, compra e venda de cavalos. Módulo dedicado, construído POR ÚLTIMO, em sprint próprio, após todos os outros estarem em produção. A dona já tem outro sistema para essa parte.

Implicação agora: apenas garantir que `unidades_negocio` aceita o tipo `haras` e que a arquitetura financeira (movimentações, contas a pagar/receber, categorias) está pronta para receber dados desse negócio. Não criar tabelas específicas de animal, reprodução, etc.

## 3. Conceitos transversais

### 3.1. Multi-unidade interno (não multi-tenant)

O sistema não é SaaS multi-tenant. É um sistema para UMA dona, que gerencia múltiplos negócios dela. Um nível de isolamento real: a `empresa`, com várias `unidades_negocio` dentro. A RLS isola por `empresa_id`. O filtro por `unidade_id` é gerencial. O seletor de unidade no header é o coração da navegação: "Todas as Unidades" mostra consolidado; uma específica mostra só aquela.

### 3.2. Regime de caixa vs competência

A dona pensa em caixa ("quanto recebi esse mês?"), não em competência. O Fluxo de Caixa mostra o que efetivamente entrou ou saiu. "Contas a Receber" e "Contas a Pagar" são as visões de competência (o previsto). Movimentações têm `data_competencia` (fato gerador) e `data_caixa` (quando o dinheiro mexeu). O Lucro Líquido do dashboard é por regime de caixa.

### 3.3. Categorias por unidade (plano de contas dinâmico)

Cada unidade tem suas próprias categorias. Três tipos: `receita` (entra no caixa e no DRE como ganho); `despesa` (sai do caixa e entra no DRE como custo); `movimentacao_patrimonial` (mexe no caixa mas não afeta o DRE — empréstimo concedido, retorno de capital, aporte/retirada do dono, transferências).

### 3.4. Contas financeiras

A dona pode ter múltiplas "carteiras" (Itaú PJ, Caixa Físico, aplicação). Toda movimentação sai de e/ou entra numa conta. "Saldo Global" = soma dos saldos de todas as contas ativas.

### 3.5. Pessoas como entidade única

Não há tabelas separadas de Cliente, Fornecedor e Tomador. Há uma só tabela `pessoas`, e cada pessoa acumula papéis. Uma pessoa, vários papéis, um cadastro.

### 3.6. Recorrência

Despesas e receitas que se repetem todo mês (aluguel, mensalidade) são modeladas como `recorrencias`. Um job mensal gera as contas previstas automaticamente. A dona não digita aluguel todo mês.

## 4. Princípios de UX

A pergunta mais frequente da dona é "como está meu mês?" — o Dashboard responde isso em menos de 2 segundos de leitura. Inadimplência é trauma: ela precisa ver claramente quem deve, quanto e há quanto tempo, em vermelho forte. Comparação entre unidades é a segunda pergunta mais frequente (gráfico de barras no dashboard). Cadastrar coisa nova precisa ser rápido: modal, não tela inteira; campos mínimos; defaults inteligentes (data = hoje, status = pendente, unidade = a selecionada). Nunca esconder o dinheiro: se entrou ou saiu, aparece no caixa. Sempre permitir voltar atrás (editar e excluir com confirmação). Anexar comprovante é opcional mas sempre presente. Datas em `dd/mm/aaaa`, valores em `R$ 1.234,56`.

## 5. O que está fora do escopo

Emissão de nota fiscal eletrônica; apuração de impostos; integração bancária via Open Finance; app mobile nativo (o sistema é web-first, responsivo); multi-idioma; multi-moeda (só BRL); folha de pagamento; conciliação bancária automática via OFX (lançamento é manual, decisão consciente); DRE formal contábil (o sistema mostra um DRE gerencial simplificado); sistema externo para clientes do escritório; relatórios para a Receita Federal.

## 6. Glossário rápido

- **Unidade de Negócio**: um dos 5 negócios.
- **Movimentação**: lançamento financeiro real (entrou ou saiu dinheiro).
- **Conta a Pagar / a Receber**: despesa/receita prevista, ainda não realizada.
- **Pagamento / Recebimento**: a baixa de uma conta — gera uma movimentação.
- **Categoria**: classificação contábil-gerencial de uma movimentação.
- **Movimentação Patrimonial**: dinheiro que mexe no caixa mas não é receita nem despesa.
- **Parcela**: cada cobrança individual de um empréstimo (juros mensal ou principal).
- **Tomador**: pessoa que pegou dinheiro emprestado.
- **Reserva**: agendamento de uso de um imóvel (Espaço ou Chácara).
- **Contrato**: acordo de serviço recorrente (típico do escritório).
- **Recorrência**: regra automática que gera conta a pagar ou receber todo período.
- **Saldo Global**: soma de saldos de todas as contas financeiras ativas.
- **Lucro Líquido**: receitas realizadas − despesas realizadas no período (não inclui movimentações patrimoniais).

## 7. Cenários reais que o sistema precisa suportar

1. **Mensalidade do escritório.** Contrato de R$ 1.200/mês, vencimento dia 10. Todo mês o sistema gera uma Conta a Receber. Ao receber via PIX, dá-se baixa: cria a movimentação realizada, marca a conta como paga, atualiza o saldo.
2. **Reserva de evento.** Reserva do Espaço para casamento daqui a 4 meses, R$ 8.500, sinal R$ 2.500. Ao confirmar, o sistema gera 2 Contas a Receber: R$ 2.500 vencendo hoje e R$ 6.000 vencendo na data do evento.
3. **Empréstimo.** Empresta R$ 30.000 a 5% por 12 meses. O sistema cria o empréstimo (ativo), gera 12 parcelas de juros de R$ 1.500 e 1 parcela de principal de R$ 30.000, e cria uma saída de caixa categoria "Capital Emprestado" (movimentação patrimonial — não conta como despesa). Cada juros pago vira receita ("Juros Recebidos"). O principal de volta vira "Retorno de Capital" (movimentação patrimonial, não entra no DRE); o empréstimo vira "quitado".
4. **Inadimplência.** Tomador não paga os juros do mês. Job diário identifica a parcela vencida, marca como "atrasada", o empréstimo vira "inadimplente" e aparece no Painel de Alertas.
5. **Despesa recorrente.** Aluguel de R$ 2.800, vence dia 9. Cadastrado como Recorrência. Job mensal gera a Conta a Pagar. Ao pagar, dá-se baixa e anexa-se o comprovante.
6. **Visão consolidada.** No fim do mês, a dona abre o Dashboard com "Todas as Unidades" e vê receita, despesa e lucro do mês, e um gráfico comparando o resultado de cada negócio.

## 8. Princípios de construção

Não tratar como projeto enterprise; não over-engineer; não inventar abstrações genéricas para "casos futuros". Na dúvida entre simplicidade e flexibilidade, escolher simplicidade. Na dúvida entre exibir mais ou menos informação, escolher menos. Na dúvida entre convenção e algo novo, seguir convenção (padrões do Next.js, shadcn, Drizzle). Quando uma decisão de produto não estiver clara, **perguntar ao humano — não chutar regra de negócio**. Justificar decisões não óbvias em 1 frase, sem ensaios.
