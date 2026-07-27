# MEMORY_CORE.md — Cérebro Ativo do Projeto
> Estado operacional atual. Atualizado a cada sessão relevante.
> Complementa o MEMORY.md (fonte de verdade completa) e o cloud.md (histórico sessão a sessão).

---

## Estado atual

**✅ v2.1.0 base** + **✅ v3.0 (Mesada + Tutorial)** + **✅ v4.0 (relatório ao responsável)** + **✅ v5.0 (importação por foto e áudio via IA)** — todas em produção, na branch **única** `main`.

Sistema de memória distribuída:
- `cloud.md` → controle de etapas/sessões e continuidade entre conversas (lido primeiro a cada sessão nova)
- `MEMORY.md` → fonte de verdade completa do projeto
- `MEMORY_CORE.md` → este arquivo, resumo operacional enxuto
- `CLAUDE.md` → instruções automáticas de início e fim de sessão
- `CHANGELOG.md`, `BUGS.md`, `PROMPTS.md`, `LINKS.md` → registros temáticos

---

## Próximo passo

**Nenhum obrigatório definido.** Todas as features planejadas (v3, v4, v5) estão implementadas e validadas em produção. Ao abrir uma nova conversa, seguir o fluxo padrão do `CLAUDE.md`: ler `cloud.md` + `MEMORY.md`, confirmar branch ativa (`git branch --show-current`, hoje sempre `main`) e perguntar o que fazer.

Pendências conhecidas, não bloqueantes:
- Módulo de Mesada (`docs/V3_ESPECIFICACAO_MODULO_MESADA.md` seção 10): histórico por ano, exportação, cruzamento com Disciplinas
- Melhorias candidatas da v5 (`docs/ROADMAP.md`): resumo semanal automático, PWA offline completo, exportar Agenda para `.ics`
- `docs/CHECKLIST_PUBLICACAO.md`: lista do que fazer **se e quando** o app for publicado publicamente — não é trabalho em andamento

---

## Regra fundamental (revertida em 2026-07-23 — atenção se ler versões antigas deste arquivo)

A regra antiga "Mesada nunca vai para `main`" **não vale mais**. Decisão do usuário (Sessão 029a): mesclar tudo em `main` porque só o pai dele (que banca a mesada) acessa o link, com autorização plena. Ponto de retorno seguro: tag `v2.1.0-publico`. Proteção técnica remanescente: feature flag `VITE_ENABLE_MESADA_MODULE` (ausente/`false` por padrão).

---

## Regras do sistema

- Não quebrar código funcional
- Não alterar arquitetura sem solicitação explícita
- Sempre atualizar `cloud.md` + `MEMORY.md` (e este arquivo, quando o estado geral mudar) após cada sessão relevante
- Sempre fazer commit + push após alterações relevantes (push funciona normalmente neste ambiente desde a Sessão 028, credenciais configuradas)
- Segredos de provedor externo (Resend, Google Gemini, VAPID) nunca em `.env` do cliente nem colados em chat — sempre secret de Edge Function, configurado pelo usuário no painel do Supabase

---

## Última sessão relevante

Ver `cloud.md` para o histórico completo, sessão a sessão. Resumo do estado no momento desta atualização (2026-07-27): v4.0 e v5.0 (foto e áudio) validadas de ponta a ponta em produção pelo usuário; auditoria geral de documentação e banco de dados em andamento (correção de RLS/performance via migration `011`, reconstrução das migrations `003`–`006` que faltavam no repositório, atualização de toda a documentação técnica desatualizada).
