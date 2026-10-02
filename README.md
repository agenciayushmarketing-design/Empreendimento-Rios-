# Empreendimento Rios (reescrita em Next.js, ENCERRADA)

> **Este repositório não é o produto.** Em 01/10/2026 ficou definido que o sistema oficial é
> `msc-tech-sistema/rios-sistema` (o aplicativo original, Vite + React + Supabase). Esta reescrita
> em Next.js foi encerrada e fica apenas como referência.

## Regras para qualquer trabalho aqui

- **Não desenvolver funcionalidade nova neste repositório.** Trabalho novo vai por PR para a branch
  `homolog` de `msc-tech-sistema/rios-sistema`, seguindo o `CLAUDE.md` de lá.
- **Não aplicar nenhuma migration deste repositório em banco algum.** O `rios-homolog` já recebeu
  correções equivalentes pelo repositório oficial; as daqui partem de um schema antigo (57 tabelas,
  hoje são 66) e desfariam correções de segurança.
- O projeto `empreendimento-rios` na Vercel (time haras-flow) aponta para o banco de homologação e
  deve ficar pausado.

## O que ainda serve de referência

- `docs/MIGRACAO.md`, seção "O que o banco faz sozinho": triggers, funções e cron do schema herdado.
- Os PRs fechados #4 a #13 documentam três bugs herdados do Lovable, todos já levados ao repositório
  oficial (rateio do haras, trigger de sócios 100%, desfazer lote de folha).
