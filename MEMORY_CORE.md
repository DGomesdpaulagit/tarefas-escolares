# MEMORY_CORE.md — Cérebro Ativo do Projeto
> Estado operacional atual. Atualizado a cada sessão.
> Complementa o MEMORY.md (fonte de verdade completa).

---

## Estado atual

**✅ v2.1.0 PÚBLICA/ESTÁVEL** (tag `v2.1.0-publico`, branch `main`) — projeto original finalizado, todas as fases entregues.
**✅ v3.0 IMPLEMENTADA** (branch `v3-mesada-pessoal`) — Módulo de Mesada por Desempenho (uso pessoal) + Tutorial guiado do app (recurso geral). Sem próximos passos pendentes no momento.

Sistema de memória distribuída:
- `MEMORY.md` → fonte de verdade completa do projeto
- `MEMORY_CORE.md` → estado operacional atual (este arquivo)
- `cloud.md` → controle de etapas e continuidade entre conversas
- `CLAUDE.md` → instruções automáticas de início e fim de sessão
- `CHANGELOG.md`, `BUGS.md`, `PROMPTS.md`, `LINKS.md` → registros temáticos

---

## Próximo passo

**Nenhum definido.** O usuário confirmou não ter mais ideias ou passos no momento (2026-07-22). Ao abrir uma nova conversa, seguir o fluxo padrão do `CLAUDE.md`: ler `cloud.md` + `MEMORY.md`, confirmar branch ativa (`git branch --show-current`) e perguntar o que fazer — não presumir continuação de nenhum item específico.

Pendências não bloqueantes conhecidas (ação do próprio usuário, fora do código):
- `git push origin v3-mesada-pessoal` — commits desta sessão estão salvos localmente, push não foi possível no ambiente (exige auth interativa)
- Token do GitHub exposto em texto plano na URL do remote `origin` — recomendado revogar/reconfigurar
- Segundo projeto Vercel para a branch pessoal (com `VITE_ENABLE_MESADA_MODULE=true`) — só necessário quando o usuário quiser um link de acesso remoto à Mesada

Ideias em aberto (não solicitadas, só sugestões — ver `docs/V3_ESPECIFICACAO_MODULO_MESADA.md` seção 10 e `DOCUMENTACAO_PROJETO.md` seção 23): histórico de mesada por ano, exportação PDF/Excel, cruzamento com Disciplinas, i18n em runtime, code-splitting do bundle.

---

## Última ação

**[Etapa 17 / Sessão 028 / 2026-07-22]** — Módulo de Mesada por Desempenho completo + Tutorial guiado do app, em 6 blocos na branch `v3-mesada-pessoal`:

1. **Base:** migration `007_mesada_module` (`mesada_config`, `mesada_materias`, `mesada_notas`, RLS), `mesadaService.ts`, `MesadaContext.tsx`, `lib/featureFlags.ts`, página `Mesada.tsx` (3 abas), `MesadaMateriaModal.tsx`. Confirmado com o usuário: Eixo A (tabela única de conceitos) e limite de MB trava o cálculo.
2. **Importação em lote** de Disciplinas existentes (`MesadaImportarDisciplinasModal.tsx`)
3. **Grade do boletim** (réplica da planilha) + gráfico de desempenho por matéria + insights automáticos
4. **Termômetro** por matéria, lembrete de fim de mês, virada de ano herdando config, data ao vivo no topo do app
5. **Tutorial guiado** com spotlight (`TourContext.tsx`, `TourOverlay.tsx`, 19 passos, botão em Configurações) — recurso geral, não exclusivo da Mesada
6. **Ajustes finos:** animação mais lenta, correção do card de navegação saindo da tela, oferta automática do tour a usuários novos (`OfertaTourModal.tsx`)

Build validado (0 erros TS) em todos os blocos. Commits locais: `cd9e5fe`, `03d2437`, `530d17f`, `c9e95e9`, `9c2bfcb`, `b63b2b4` (push pendente, ver seção acima).

---

## Último commit

`b63b2b4` — fix(tutorial): animação mais lenta, oferta a novos usuários, card sempre visível (Sessão 028f) — branch `v3-mesada-pessoal`

---

## Regras do sistema

- Não quebrar código funcional
- Não alterar arquitetura sem solicitação explícita
- Módulo de Mesada e qualquer código específico dele **nunca** vão para `main` (branch pública) — regra do usuário, ver seção "Regra fundamental" no `MEMORY.md`
- Sempre atualizar `MEMORY_CORE.md` e `MEMORY.md` após cada sessão relevante
- Sempre fazer commit após alterações (push depende de credenciais do usuário nesse ambiente)
- Só avançar para features após documentação estar estável

---

## Contexto vivo

Etapas 1–16 construíram e finalizaram a v2.1.0 pública (100% das fases do roadmap original entregues).
Etapa 17 (Sessões 027–028) é dedicada à v3.0: módulo pessoal de Mesada por Desempenho + tutorial guiado do app, na branch `v3-mesada-pessoal`.

Tags desta sessão: #mesada #boletim #tutorial #spotlight #onboarding #virada-de-ano

---

## Status

**✅ v2.1.0 EM PRODUÇÃO** (main) — **✅ v3.0 PRONTA PARA USO** (v3-mesada-pessoal, servidor local; deploy remoto pessoal é passo futuro opcional). Sem próximo passo definido — aguardando novas instruções do usuário.
