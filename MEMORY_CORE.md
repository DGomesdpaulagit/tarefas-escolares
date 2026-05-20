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

**[Etapa 3 / Sessão 8]** — Fase 1 UX implementada:
- Filtro de Matéria adicionado ao painel de filtros (lista dinâmica por matérias cadastradas)
- Busca expandida para 6 campos: title, subject_name, notes, sector, origin, description
- TarefaForm: todos os grids duplos agora são `grid-cols-1 sm:grid-cols-2` (mobile-friendly)
- Urgentes no topo: confirmado como já implementado

---

## Último commit

`b5bc303` — merge: Etapa 3 / Sessão 8 — Fase 1 UX

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
