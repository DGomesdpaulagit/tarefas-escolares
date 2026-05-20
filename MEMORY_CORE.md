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

App em produção, 100% funcional. **Fase 1 UX concluída ✅**
Próximo bloco de trabalho: Fase 2 — Features Intermediárias.

---

## Próximo passo

**Etapa 4 — Fase 2 (prioridade a definir com o usuário)**

Candidatos:
- Tema claro/escuro + persistência no Supabase
- Configurações avançadas (avatar upload, matérias personalizadas)
- Notificações de prazo (Web Notifications API)
- Perfil inteligente (insights automáticos em Metricas.tsx)

---

## Última ação

**[Etapa 4 / Sessão 9]** — Perfil Inteligente implementado em `Metricas.tsx`:
- 5 insights automáticos: foco urgente, matéria mais produtiva, mais atrasada, progresso médio, ritmo semanal
- Corrigido bug do `materiasComAtraso` (cálculo estava errado)
- Componente `InsightCard` com variantes de cor

---

## Último commit

A commitar — Etapa 4 / Sessão 9

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

Etapas 1 e 2 foram 100% dedicadas a estruturar o sistema de memória e continuidade.
Etapa 3 implementou a Fase 1 UX completa. Projeto pronto para Fase 2.

Tags desta fase: #ux #filtros #busca #mobile

---

## Status

ATIVO — aguardando Etapa 4 (Fase 2)
