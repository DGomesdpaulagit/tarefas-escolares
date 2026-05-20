# Changelog — Tarefas Escolares

Todas as mudanças notáveis são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

### Adicionado (Etapa 5 / Sessão 11 — 2026-05-20)
- **Sons de transição** via Web Audio API (sem arquivos externos):
  - Chime ascendente ao concluir tarefa
  - Tom descendente ao desmarcar
  - Pop curto ao criar nova tarefa
  - Descida rápida ao remover tarefa
- Sons controlados pelo toggle "Habilitar sons" em Configurações → Notificações
- Preview sonoro ao salvar configurações com sons ativados

### Adicionado (Etapa 4 / Sessão 10 — 2026-05-20)
- **Avatar upload** em Configurações → Perfil, com fallback de iniciais e limite de 2 MB
- **Campo Bio** no perfil (até 200 caracteres, salvo no Supabase)
- **Carregamento real do perfil** do Supabase no mount (não mais de user_metadata)
- **AbaMaterias com persistência**: lista, adiciona e remove matérias via `subjectService`
- Matérias padrão disponíveis para adição rápida com 1 clique
- Matérias personalizadas via campo de texto livre

### Adicionado (Etapa 4 / Sessão 9 — 2026-05-20)
- **Perfil Inteligente** na página de Métricas com 5 insights automáticos: foco urgente, matéria mais produtiva, matéria mais atrasada, progresso médio e ritmo semanal
- Componente `InsightCard` reutilizável com variantes de cor
- KPI "Ritmo (7 dias)" mostrando tarefas concluídas na última semana
- Corrigido bug no cálculo de matérias com atraso (estava incorreto)

### Adicionado (Etapa 3 / Sessão 8 — 2026-05-20)
- Filtro de **Matéria** no painel de filtros com lista dinâmica das matérias cadastradas
- **Busca avançada multi-campo**: pesquisa agora inclui notas, setor, origem e descrição
- **Formulário mobile responsivo**: campos duplos agora empilham em telas pequenas (`sm:grid-cols-2`)
- Ordenação de tarefas urgentes no topo (confirmada como já implementada)

---

## [2.0.0] — 2026-05-20

### Adicionado
- **Autenticação real** com Supabase Auth (email + senha)
- **Cadastro** de novos usuários com criação automática de perfil via trigger
- **Redefinição de senha** com link por email (`ResetPassword.tsx`)
- **CRUD completo de tarefas** com persistência no PostgreSQL (Supabase)
- **Filtros de tarefas**: status, matéria, prioridade e busca por texto
- **Detecção de urgência**: tarefas com prazo ≤ 3 dias marcadas automaticamente
- **Métricas e gráficos** (Recharts): total, concluídas, em andamento, passaram do prazo
- **Perfil analítico**: taxa de conclusão, taxa de atraso, ponto de atenção
- **Calendário mensal** (Agenda) com visualização de tarefas por dia
- **Importação de planilhas** Excel (`.xlsx`) e CSV com parser dedicado
- **Exportação** de dados em JSON e Excel
- **Histórico de importações** com data, tamanho e quantidade importada
- **Página de Configurações** com 4 abas: Perfil, Tema, Notificações, Matérias
- **Design system Academic Dark**: fundo `#0f1117`, acento âmbar `#f59e0b`
- **Sidebar responsiva** com navegação entre páginas
- **Row Level Security (RLS)** em todas as tabelas — dados isolados por usuário
- **Sincronização entre dispositivos** (dados no Supabase, não no localStorage)
- **CI/CD automático**: push em `main` → deploy Vercel em ~30s
- **Toasts de feedback** em todas as ações (Sonner)
- **Acessibilidade**: aria-labels, focus styles, cursor-pointer em interativos
- **Documentação completa**: ARQUITETURA.md, BANCO_DE_DADOS.md, DEPLOY.md, ROADMAP.md, MEMORY.md
- **Base de conhecimento**: CHANGELOG.md, PROMPTS.md, BUGS.md, LINKS.md

### Modificado
- Migração completa de **localStorage** para **Supabase PostgreSQL**
- Substituição de autenticação mockada por **Supabase Auth real**
- Campos da tarefa renomeados para inglês: `tarefa→title`, `materia→subject_name`, `dataEntrega→due_date`, etc.
- ID das tarefas migrado de numérico para **UUID**
- `calcularDiasRestantes()` calculado em render time (não armazenado no banco)
- `vercel.json` adicionado com `installCommand: "npm install"` (evita falha do pnpm no CI)

### Removido
- **Todos os artefatos Manus AI**: `ManusDialog.tsx`, `Map.tsx`, `debug-collector.js`, `version.json`
- Dependências quebradas: `express`, `drizzle`, `mysql2`, `embla-carousel-react`, `cmdk`, `vaul`, `next-themes`
- Código morto: `server/db.ts`, `server/routers.ts`, `usePersistFn.ts`
- Dados hardcoded: `TAREFAS_INICIAIS` (lista de tarefas de demonstração)
- Arquivo de config Manus: `.project-config.json`, `template.json`
- Scripts Manus no `package.json`: plugin `vite-plugin-manus-runtime`
- Analytics Manus no `index.html`: script com `%VITE_ANALYTICS_ENDPOINT%`
- Componentes shadcn/ui sem dependência instalada: carousel, drawer, input-otp, menubar, navigation-menu, radio-group, resizable, slider, toggle, toggle-group, context-menu, hover-card, aspect-ratio, command

### Corrigido
- `tw-animate-css` → `@plugin "tailwindcss-animate"` (sintaxe Tailwind v4)
- `usePersistFn` deletado → reescrito com `useCallback` nativo
- `createClient<Database>` com generic incompatível → removido generic
- Variáveis de ambiente Vercel não persistidas → salvas via Vercel API
- `pnpm install` falhando no CI → forçado `npm install` no vercel.json
- `onAuthStateChange` callback type mismatch → `async` adicionado
- `TarefaForm`: `subject_id` ausente no estado → adicionado com `null`

### Segurança
- RLS ativo em todas as 5 tabelas do banco
- `.env.local` no `.gitignore` (nunca commitado)
- Chaves de ambiente injetadas somente em build time (não expostas em runtime)
- Trigger `SECURITY DEFINER` para criação automática de perfil

---

## [1.0.0] — 2026-05-18 (Manus AI — descontinuado)

### Nota
Versão original gerada pelo Manus AI. Continha autenticação mockada via localStorage,
dados hardcoded, dependências quebradas e artefatos de debugging do gerador.
Completamente substituída pela v2.0.0.

---

[Não lançado]: https://github.com/DGomesdpaulagit/tarefas-escolares/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/DGomesdpaulagit/tarefas-escolares/releases/tag/v2.0.0
[1.0.0]: https://github.com/DGomesdpaulagit/tarefas-escolares/releases/tag/v1.0.0
