# Links — Tarefas Escolares

Todos os links relevantes do projeto organizados por categoria.

---

## Produção

| Recurso | URL |
|---------|-----|
| **App (produção)** | https://tarefas-escolares-five.vercel.app |
| **GitHub (repositório)** | https://github.com/DGomesdpaulagit/tarefas-escolares |
| **Vercel (dashboard)** | https://vercel.com/davi-gomes-de-paula-s-projects/tarefas-escolares |
| **Supabase (dashboard)** | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn |

---

## Supabase

| Recurso                    | URL                                                                       |
| -------------------------- | ------------------------------------------------------------------------- |
| **Dashboard do projeto**   | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn               |
| **Editor SQL**             | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn/editor        |
| **Tabelas (Table Editor)** | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn/editor/tables |
| **Autenticação (Auth)**    | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn/auth/users    |
| **RLS (Policies)**         | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn/auth/policies |
| **Logs**                   | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn/logs/explorer |
| **API Settings**           | https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn/settings/api  |

---

## Vercel

| Recurso                   | URL                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| **Projeto**               | https://vercel.com/davi-gomes-de-paula-s-projects/tarefas-escolares                                 |
| **Deployments**           | https://vercel.com/davi-gomes-de-paula-s-projects/tarefas-escolares/deployments                     |
| **Variáveis de Ambiente** | https://vercel.com/davi-gomes-de-paula-s-projects/tarefas-escolares/settings/environment-variables  |
| **Logs de Build**         | https://vercel.com/davi-gomes-de-paula-s-projects/tarefas-escolares/deployments (selecionar deploy) |
|                           |                                                                                                     |

---

## GitHub

| Recurso | URL |
|---------|-----|
| **Repositório** | https://github.com/DGomesdpaulagit/tarefas-escolares |
| **Branch main (única, publicada)** | https://github.com/DGomesdpaulagit/tarefas-escolares/tree/main |
| **Commits** | https://github.com/DGomesdpaulagit/tarefas-escolares/commits/main |
| **Issues** | https://github.com/DGomesdpaulagit/tarefas-escolares/issues |
| **Releases** | https://github.com/DGomesdpaulagit/tarefas-escolares/releases |

> A branch `v3-mesada-pessoal` foi descontinuada — tudo foi mesclado em `main` (Sessão 029a, 2026-07-23). Hoje o projeto trabalha só em `main`; a tag `v2.1.0-publico` marca o ponto de retorno seguro anterior à Mesada, se um dia o app for publicado ao público (ver `docs/CHECKLIST_PUBLICACAO.md`).

---

## Documentação das Tecnologias

### Core
| Tecnologia | Documentação |
|-----------|-------------|
| React 19 | https://react.dev |
| TypeScript 5 | https://www.typescriptlang.org/docs |
| Vite 7 | https://vite.dev |
| Tailwind CSS v4 | https://tailwindcss.com/docs |

### Backend / Banco
| Tecnologia | Documentação |
|-----------|-------------|
| Supabase JS v2 | https://supabase.com/docs/reference/javascript |
| Supabase Auth | https://supabase.com/docs/guides/auth |
| Row Level Security | https://supabase.com/docs/guides/database/postgres/row-level-security |
| Supabase Management API | https://supabase.com/docs/reference/api/introduction |
| Supabase Edge Functions | https://supabase.com/docs/guides/functions |
| pg_cron | https://supabase.com/docs/guides/database/extensions/pg_cron |

### IA e E-mail (v4.0 / v5.0)
| Serviço | Documentação | Uso no projeto |
|-----------|-------------|-----|
| Google Gemini API | https://ai.google.dev/gemini-api/docs | Análise de foto/áudio (`GOOGLE_API_KEY`) |
| Google AI Studio (gerar chave) | https://aistudio.google.com/apikey | — |
| Resend | https://resend.com/docs | Relatório mensal ao responsável (`RESEND_API_KEY`) |

### UI
| Tecnologia | Documentação |
|-----------|-------------|
| shadcn/ui | https://ui.shadcn.com |
| Lucide Icons | https://lucide.dev/icons |
| Recharts | https://recharts.org/en-US/api |
| Framer Motion | https://www.framer.com/motion |
| Sonner (toasts) | https://sonner.emilkowal.ski |

### Roteamento / Utilitários
| Tecnologia | Documentação |
|-----------|-------------|
| Wouter v3 | https://github.com/molefrog/wouter |
| date-fns | https://date-fns.org/docs |
| xlsx (SheetJS) | https://docs.sheetjs.com |

---

## APIs Utilizadas

| API | Endpoint Base | Uso |
|-----|--------------|-----|
| Supabase REST | `https://qnrrgkicsjdbrwhjelqn.supabase.co/rest/v1` | CRUD de dados |
| Supabase Auth | `https://qnrrgkicsjdbrwhjelqn.supabase.co/auth/v1` | Login/Cadastro/Reset |
| Vercel API v9 | `https://api.vercel.com/v9` | Config de env vars (setup) |
| GitHub REST v3 | `https://api.github.com` | Criação do repo (setup) |

---

## Referências Externas

| Recurso | URL |
|---------|-----|
| Keep a Changelog | https://keepachangelog.com/pt-BR/1.0.0 |
| Semantic Versioning | https://semver.org/lang/pt-BR |
| OWASP Top 10 | https://owasp.org/www-project-top-ten |
| PostgreSQL Docs | https://www.postgresql.org/docs |

---

## Arquivos de Documentação Local

| Arquivo | Descrição |
|---------|-----------|
| [cloud.md](./cloud.md) | Registro de continuidade entre sessões — lido automaticamente a cada conversa |
| [MEMORY.md](./MEMORY.md) | Estado completo do projeto — referência principal entre sessões |
| [CLAUDE.md](./CLAUDE.md) | Instruções automáticas de início/fim de sessão |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de versões (Keep a Changelog) |
| [PROMPTS.md](./PROMPTS.md) | Prompts usados para construir o projeto |
| [BUGS.md](./BUGS.md) | Bugs resolvidos e conhecidos |
| [LINKS.md](./LINKS.md) | Este arquivo |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Arquitetura técnica detalhada |
| [docs/BANCO_DE_DADOS.md](docs/BANCO_DE_DADOS.md) | Esquema completo do banco |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Guia de deploy e CI/CD |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Roadmap por fases |
| [docs/CHECKLIST_PUBLICACAO.md](docs/CHECKLIST_PUBLICACAO.md) | O que fazer se o app for publicado publicamente um dia |
| [docs/AUDITORIA.md](docs/AUDITORIA.md) | Auditoria de código histórica (2026-05-19) |
| [docs/V3_ESPECIFICACAO_MODULO_MESADA.md](docs/V3_ESPECIFICACAO_MODULO_MESADA.md) | Especificação: Mesada por Desempenho |
| [docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md](docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md) | Especificação: relatório mensal ao responsável |
| [docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md](docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md) | Especificação: importação por foto e áudio |

---

*Atualizado em: 2026-07-27*
