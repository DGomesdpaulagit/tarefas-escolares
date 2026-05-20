# Prompts — Tarefas Escolares

Registro de prompts usados para construir e evoluir o projeto.
Útil para replicar abordagens em sessões futuras.

---

## Prompts de Arquitetura e Setup

### P-001 — Refatoração completa do projeto Manus AI
**Contexto:** Projeto gerado pelo Manus AI com autenticação mockada, dados hardcoded e dependências quebradas.
**Prompt:**
```
Analise o projeto inteiro e execute uma refatoração completa:
1. Substituir autenticação localStorage por Supabase Auth real
2. Migrar dados hardcoded para PostgreSQL (Supabase)
3. Remover todos os artefatos Manus AI
4. Corrigir todos os erros TypeScript
5. Manter o design Academic Dark intacto
```
**Resultado:** Projeto completamente refatorado, 0 erros TS, deploy funcional.

---

### P-002 — Deploy automatizado Supabase + GitHub + Vercel
**Contexto:** Precisava publicar o projeto sem configuração manual de cada serviço.
**Prompt:**
```
Automatize o deploy completo:
1. Criar projeto Supabase com tabelas e RLS via API
2. Criar repositório GitHub e fazer push
3. Conectar Vercel ao GitHub com CI/CD automático
4. Configurar variáveis de ambiente em todos os serviços
```
**Resultado:** Pipeline completo — push em main → Vercel deploy em ~30s.

---

### P-003 — Correção de tela preta em produção
**Contexto:** App publicado na Vercel exibia tela preta com erro de variáveis de ambiente.
**Prompt:**
```
[imagem do console com erro]
Analise o print e corrija: o app está publicado na Vercel mas exibe tela preta.
No console: "Uncaught Error: Variáveis de ambiente VITE_SUPABASE_URL e 
VITE_SUPABASE_ANON_KEY são obrigatórias."
```
**Causa identificada:** Env vars passadas como `--env` no CLI não foram persistidas no projeto Vercel.
**Solução:** Usar Vercel API para salvar variáveis permanentemente em production/preview/development.

---

### P-004 — Fluxo de reset de senha
**Contexto:** Link de reset do Supabase abria página em branco.
**Prompt:**
```
[imagem do console com erro]
Implemente o fluxo completo de recuperação de senha.
Problema: ao clicar no link de reset, abre página em branco.
Console: "Error: Auth session missing!"
```
**Solução:** Criar `ResetPassword.tsx` que escuta evento `PASSWORD_RECOVERY` no `onAuthStateChange`.

---

## Prompts de Documentação

### P-005 — Criação do MEMORY.md
**Contexto:** Sessão crescia muito; precisava de documento de continuidade entre sessões.
**Prompt:**
```
Crie um MEMORY.md extremamente detalhado na raiz do projeto cobrindo:
- Stack completa com versões
- URLs de produção (Supabase, Vercel, GitHub)
- Esquema do banco de dados (todas as tabelas e colunas)
- Design system (cores, fontes, componentes)
- Funcionalidades implementadas vs pendentes
- Bugs resolvidos com causa e solução
- Decisões técnicas com justificativas
- Roadmap em 3 fases
- Prompt exato para próxima sessão
```
**Resultado:** MEMORY.md com ~490 linhas, 24 seções.

---

### P-006 — Base de conhecimento (CHANGELOG, PROMPTS, BUGS, LINKS)
**Contexto:** Criar documentação estruturada para o projeto após MEMORY.md estar pronto.
**Prompt:**
```
Leia o MEMORY.md. Verifique e crie os seguintes arquivos se não existirem:
- CHANGELOG.md (formato Keep a Changelog)
- PROMPTS.md (registro de prompts usados)
- BUGS.md (bugs resolvidos e conhecidos)
- LINKS.md (todos os links do projeto)
Depois: commit "docs: add project knowledge base files" e push.
```

---

## Prompts de Features (Fase 1)

### P-007 — Legendas nos filtros
**Status:** Pendente
**Prompt sugerido:**
```
Em client/src/pages/Tarefas.tsx, adicione legendas acima de cada Select de filtro.
Exemplo: "Status", "Matéria", "Prioridade" como <label> ou <span> com estilo text-slate-400.
Não altere a lógica de filtragem.
```

---

### P-008 — Ordenação de tarefas urgentes
**Status:** Pendente
**Prompt sugerido:**
```
Em client/src/contexts/TarefasContext.tsx, modifique tarefasFiltradas para ordenar:
1. Tarefas urgentes (isUrgente = true) no topo
2. Dentro de urgentes: mais próximas do prazo primeiro
3. Não urgentes: por due_date crescente
```

---

### P-009 — Busca avançada multi-campo
**Status:** Pendente
**Prompt sugerido:**
```
Expanda a busca em TarefasContext.tsx para pesquisar em múltiplos campos:
- title (já implementado)
- description
- subject_name
A busca deve ser case-insensitive e usar .toLowerCase().includes().
```

---

## Template de Prompt para Nova Sessão

```
Projeto: Tarefas Escolares (SaaS de gestão de tarefas escolares)
Stack: React 19 + TypeScript + Vite + Tailwind v4 + Supabase + Vercel
Repositório local: C:\Users\HP\Downloads\tarefas-escolares-app (1)\
GitHub: https://github.com/DGomesdpaulagit/tarefas-escolares
App em produção: https://tarefas-escolares-five.vercel.app

Leia o MEMORY.md na raiz do projeto para contexto completo.
Estado atual: [descrever o que foi feito na última sessão]

TAREFA: [descrever a feature ou correção específica]

REGRAS:
- NÃO quebrar código funcional
- NÃO alterar design Academic Dark
- NÃO remover dependências instaladas
- Após implementar: npm run build → confirmar 0 erros → git commit → git push
```

---

---

## Comportamentos validados pelo usuário (Sessão 6)

### P-010 — Sistema de sessões numeradas com cloud.md
**Validado em:** 2026-05-20
**Resultado:** Aprovado — "muito bom claude, vc alterou, registrou e me certificou sobre as alterações. continue assim"
**O que foi aprovado:**
- Criar `cloud.md` como controle de sessões numeradas `[Sessão X]`
- Claude lê `cloud.md` no início e anuncia a próxima sessão antes de começar
- Certificar ao usuário após cada ação importante que foi registrado em `MEMORY.md` + Obsidian
- Checklist obrigatório ao final de cada sessão antes de encerrar

---

### P-011 — Nomenclatura Etapa/Sessão para conversas do projeto
**Validado em:** 2026-05-20
**Resultado:** Aprovado com entusiasmo — "MUITOOOOO BEM CLAUDE, PERFEITO. CONTINUE ASSIM"
**O que foi aprovado:**
- Etapa = conversa completa (thread do Claude)
- Sessão = bloco de progresso dentro de uma Etapa
- Ao final de cada Etapa, Claude sugere o nome da conversa no formato `Etapa X - (nome)`
- Nome cobre tudo que aconteceu na conversa inteira, não só a última sessão

---

*Atualizado em: 2026-05-20*
