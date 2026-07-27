# 📚 Tarefas Escolares

Sistema profissional de gerenciamento de tarefas escolares com autenticação real, banco de dados online e sincronização entre dispositivos.

## ✨ Funcionalidades

- **Autenticação completa** via Supabase (login, cadastro, recuperação de senha)
- **Sincronização em tempo real** — acesse suas tarefas em qualquer dispositivo
- **CRUD de tarefas** com busca, filtros e ordenação
- **Urgência automática** — tarefas com prazo ≤ 3 dias sobem para o topo
- **Nova Tarefa em 3 modos** — escrever manualmente, importar por **foto** (quadro/agenda) ou por **áudio** (gravação ou upload), com análise por IA (Google Gemini) sugerindo as tarefas
- **Importação de planilhas** (.xlsx e .csv) e **exportação** (JSON e Excel), com histórico
- **Dashboard "Visão Geral"** com progresso da semana, desempenho geral e próximos prazos
- **Agenda** com visão semanal e mensal, criação rápida por dia
- **Dashboard de métricas** com gráficos interativos e Perfil Inteligente (insights automáticos)
- **Catálogo visual de Disciplinas** (emoji, cor, contagem de tarefas)
- **Relatório mensal para o responsável** (opcional) — resumo do desempenho enviado por e-mail todo dia 25, com verificação por código de 6 dígitos
- **Notificações push** (Web Push) configuráveis
- **Onboarding guiado** e **tutorial interativo** (spotlight) explicando cada área do app
- **i18n real** — interface completa em pt-BR, en e es
- **Tema claro/escuro** — Academic Dark/Light
- **Design responsivo**, PWA instalável
- **Módulo de Mesada por Desempenho** (uso pessoal, atrás de feature flag — ver seção Branches)

## 🚀 Stack

| Categoria | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript 5.6 |
| Build | Vite 7 |
| Estilização | Tailwind CSS v4 + shadcn/ui |
| Roteamento | Wouter |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Notificações UI | Sonner |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| IA (foto/áudio) | Google Gemini (API gratuita) |
| E-mail (relatório) | Resend |
| Deploy | Vercel (CI/CD automático a cada push em `main`) |

## 🏃 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- npm (o projeto usa `npm run <script>`; veja a nota sobre lockfiles abaixo)

### 1. Clone e instale
```bash
git clone https://github.com/DGomesdpaulagit/tarefas-escolares.git
cd tarefas-escolares
npm install
```

### 2. Configure o ambiente
```bash
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (Supabase → Settings → API)
```

### 3. Configure o Supabase
Execute, em ordem, todos os arquivos de `supabase/migrations/` no **SQL Editor** do seu projeto Supabase (ou use o MCP do Supabase / Supabase CLI). Edge Functions em `supabase/functions/` precisam ser deployadas separadamente — ver [docs/DEPLOY.md](docs/DEPLOY.md).

### 4. Inicie o servidor
```bash
npm run dev
```

Acesse: `http://localhost:3000`

> **Nota sobre gerenciador de pacotes:** o repositório tem `package-lock.json` (npm) e `pnpm-lock.yaml` (pnpm) versionados ao mesmo tempo. O fluxo de desenvolvimento atual usa `npm`. Ter os dois lockfiles é uma inconsistência conhecida — considere remover um deles.

## 🌐 Deploy na Vercel

Conecte o repositório GitHub à Vercel (deploy automático a cada push em `main`) ou use a CLI:
```bash
npm i -g vercel
vercel
```

Variáveis de ambiente necessárias no painel da Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (e `VITE_ENABLE_MESADA_MODULE=true`, se quiser o módulo pessoal de Mesada ativo em produção). As secrets de Edge Functions (Resend, Gemini, VAPID) são configuradas **no painel do Supabase**, não na Vercel.

Ver guia completo: [docs/DEPLOY.md](docs/DEPLOY.md)

## 📁 Estrutura

```
client/src/
├── components/     # Componentes reutilizáveis (inclui ui/ do shadcn)
├── pages/          # Páginas da aplicação
├── contexts/       # React contexts (Auth, Tarefas, Disciplinas, Arquivos, Mesada, Theme, Language, Tour)
├── services/       # Camada de acesso ao Supabase (tables, storage, edge functions)
├── supabase/       # Cliente Supabase
├── types/          # Tipos TypeScript
└── lib/            # Utilitários (i18n, helpers de data, candidatas de IA)

supabase/
├── migrations/     # Histórico de schema SQL, numerado
└── functions/      # Edge Functions Deno (notificações, relatório, análise de foto/áudio)
```

## 📖 Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [Banco de Dados](docs/BANCO_DE_DADOS.md)
- [Deploy](docs/DEPLOY.md)
- [Auditoria (2026-05-19, histórica)](docs/AUDITORIA.md)
- [Roadmap](docs/ROADMAP.md)
- [Checklist de publicação](docs/CHECKLIST_PUBLICACAO.md) — o que fazer se o app for publicado publicamente um dia
- [Especificação: Mesada por Desempenho](docs/V3_ESPECIFICACAO_MODULO_MESADA.md)
- [Especificação: Relatório ao responsável](docs/V4_ESPECIFICACAO_RELATORIO_RESPONSAVEL.md)
- [Especificação: Importação por foto/áudio](docs/V5_ESPECIFICACAO_IMPORTACAO_POR_IMAGEM.md)
- [Documentação completa do projeto](DOCUMENTACAO_PROJETO.md)
- [Registro de continuidade entre sessões](cloud.md)

## 🌿 Branches

O projeto usa **uma única branch**, `main`, publicada em produção (`tarefas-escolares-five.vercel.app`). O módulo de Mesada por Desempenho (uso pessoal) vive no mesmo código, protegido pela variável de ambiente `VITE_ENABLE_MESADA_MODULE` — sem ela (ou com `false`), o módulo fica invisível. A antiga separação em uma branch `v3-mesada-pessoal` própria foi descontinuada: tudo foi mesclado em `main` (ver `MEMORY.md` seção 22 para o histórico dessa decisão). Existe uma tag `v2.1.0-publico` marcando o último commit antes da Mesada, como ponto de retorno seguro se o app for publicado ao público um dia — ver [docs/CHECKLIST_PUBLICACAO.md](docs/CHECKLIST_PUBLICACAO.md).

## 📄 Licença

MIT
