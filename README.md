# 📚 Tarefas Escolares

Sistema profissional de gerenciamento de tarefas escolares com autenticação real, banco de dados online e sincronização entre dispositivos.

## ✨ Funcionalidades

- **Autenticação completa** via Supabase (login, cadastro, recuperação de senha)
- **Sincronização em tempo real** — acesse suas tarefas em qualquer dispositivo
- **CRUD de tarefas** com busca, filtros e ordenação
- **Urgência automática** — tarefas com prazo ≤ 3 dias sobem para o topo
- **Dashboard de métricas** com gráficos interativos e perfil analítico
- **Agenda/Calendário** mensal com visualização de tarefas por data
- **Importação de planilhas** (.xlsx e .csv)
- **Exportação** (JSON e Excel)
- **Histórico de importações**
- **Página de Configurações** (perfil, notificações, matérias)
- **Tutorial guiado** — explica todas as áreas do app com efeito spotlight, acessível em Configurações
- **Design responsivo** — funciona em mobile e desktop
- **Tema Academic Dark** — design profissional

## 🚀 Stack

| Categoria | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite 7 |
| Estilização | Tailwind CSS v4 + shadcn/ui |
| Roteamento | Wouter |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Notificações | Sonner |
| Backend/DB | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel |

## 🏃 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- pnpm

### 1. Clone e instale
```bash
git clone https://github.com/seu-usuario/tarefas-escolares.git
cd tarefas-escolares
pnpm install
```

### 2. Configure o ambiente
```bash
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

### 3. Configure o Supabase
Execute o arquivo `supabase/migrations/001_initial_schema.sql` no **SQL Editor** do seu projeto Supabase.

### 4. Inicie o servidor
```bash
pnpm dev
```

Acesse: `http://localhost:3000`

## 🌐 Deploy na Vercel

```bash
npm i -g vercel
vercel
```

Adicione as variáveis de ambiente no painel da Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Ver guia completo: [docs/DEPLOY.md](docs/DEPLOY.md)

## 📁 Estrutura

```
src/
├── components/     # Componentes reutilizáveis
│   └── ui/         # Componentes shadcn/ui
├── pages/          # Páginas da aplicação
├── contexts/       # React contexts (Auth, Tarefas, Arquivos)
├── services/       # Camada de acesso ao Supabase
├── supabase/       # Cliente Supabase
├── types/          # Tipos TypeScript
└── lib/            # Utilitários
```

## 📖 Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [Banco de Dados](docs/BANCO_DE_DADOS.md)
- [Deploy](docs/DEPLOY.md)
- [Auditoria](docs/AUDITORIA.md)
- [Roadmap](docs/ROADMAP.md)
- [Documentação completa do projeto](DOCUMENTACAO_PROJETO.md)

## 🌿 Branches

| Branch | Conteúdo |
|---|---|
| `main` | Versão pública/estável (v2.1.0) |
| `v3-mesada-pessoal` | Versão de uso pessoal (v3.0) — inclui um módulo extra de mesada por desempenho escolar, disponível apenas com a variável de ambiente `VITE_ENABLE_MESADA_MODULE=true`. Não é publicada. |

## 📄 Licença

MIT
