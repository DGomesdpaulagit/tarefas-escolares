# MEMORY_CORE.md — Cérebro Ativo do Projeto
> Estado operacional atual. Atualizado a cada sessão.
> Complementa o MEMORY.md (fonte de verdade completa).

---

## Estado atual

Sistema de memória distribuída completamente estruturado:
- `MEMORY.md` → fonte de verdade completa do projeto (~490 linhas)
- `MEMORY_CORE.md` → estado operacional atual (este arquivo)
- `SESSIONS/` → logs numerados por sessão
- `cloud.md` → controle de etapas e continuidade entre conversas
- `CLAUDE.md` → instruções automáticas de início e fim de sessão

App em produção, 100% funcional. Nenhuma feature nova implementada ainda.
Próximo bloco de trabalho: Fase 1 UX (Etapa 3).

---

## Próximo passo

**Etapa 3 — Implementação Fase 1 UX**

1. Legendas nos filtros → `client/src/pages/Tarefas.tsx`
2. Melhorias mobile → `TarefaCard.tsx` + `TarefaForm.tsx`
3. Busca avançada multi-campo → `client/src/contexts/TarefasContext.tsx`
4. Tarefas urgentes no topo → `client/src/contexts/TarefasContext.tsx`

---

## Última ação

**[Etapa 2 / Sessão 7]** — Integração do Mega Prompt ao sistema de memória.
Criado `MEMORY_CORE.md` e estrutura `SESSIONS/`.
Nenhum código de produção alterado.

---

## Último commit

`61baacd` — docs: register validated behavior P-011 in PROMPTS.md

---

## Regras do sistema

- Não quebrar código funcional
- Não alterar arquitetura sem solicitação explícita
- Sempre atualizar MEMORY_CORE.md após cada sessão
- Sempre registrar sessão em `SESSIONS/NNN.md`
- Sempre fazer commit após alterações
- Só avançar para features após documentação estar estável

---

## Contexto vivo

Etapa 1 e 2 foram 100% dedicadas a estruturar o sistema de memória e continuidade.
O projeto está pronto para receber features. A Fase 1 UX está mapeada e documentada
no ROADMAP.md — será executada na Etapa 3.

Tags desta fase: #sistema #memoria #documentacao

---

## Status

ATIVO — aguardando Etapa 3
