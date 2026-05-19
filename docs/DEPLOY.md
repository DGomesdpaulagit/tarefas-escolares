# Deploy — Tarefas Escolares

Guia completo para publicar o projeto em produção.

---

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (grátis)
2. Clique em **New Project**
3. Escolha um nome, senha do banco e região (preferencialmente São Paulo — `sa-east-1`)
4. Aguarde o projeto ser inicializado (~2 min)

### 1.1 Executar o Schema

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Clique em **Run** (ou `Ctrl+Enter`)
5. Verifique em **Table Editor** se as tabelas foram criadas

### 1.2 Obter as Credenciais

1. Vá em **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 1.3 Configurar Auth (opcional)

1. Vá em **Authentication → Settings**
2. Desabilite "Enable email confirmations" para testes locais
3. Em produção: configure um domínio de email customizado e templates

---

## 2. Subir o Código no GitHub

```bash
# Inicializar repositório
git init
git add .
git commit -m "feat: Tarefas Escolares v2.0 — refatoração completa com Supabase"

# Criar repositório no GitHub e subir
git remote add origin https://github.com/SEU_USUARIO/tarefas-escolares.git
git branch -M main
git push -u origin main
```

---

## 3. Deploy na Vercel

### Opção A — Via Interface Web

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New Project**
3. Importe o repositório `tarefas-escolares`
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon
5. Framework: **Vite**
6. Build command: `pnpm build`
7. Output directory: `dist`
8. Clique em **Deploy**

### Opção B — Via CLI

```bash
npm i -g vercel
cd tarefas-escolares
vercel

# Seguir os prompts:
# ? Set up and deploy? Y
# ? Which scope? (sua conta)
# ? Link to existing project? N
# ? What's your project name? tarefas-escolares
# ? In which directory is your code? ./
# ? Want to override settings? N
```

Adicionar variáveis de ambiente:
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

---

## 4. Variáveis de Ambiente

| Variável | Onde encontrar | Obrigatória |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key | ✅ |

---

## 5. Configurar Domínio Customizado (Opcional)

1. No painel da Vercel, vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure os DNS seguindo as instruções da Vercel
4. No Supabase, adicione o domínio em **Authentication → URL Configuration → Site URL**

---

## 6. Checklist Pré-Deploy

- [ ] `.env` não está no repositório (`.gitignore` inclui `.env`)
- [ ] `VITE_SUPABASE_URL` configurada na Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` configurada na Vercel
- [ ] Schema SQL executado no Supabase
- [ ] RLS ativo em todas as tabelas
- [ ] Build local passa: `pnpm build`
- [ ] TypeCheck passa: `pnpm check`

---

## 7. Monitoramento

- **Logs da Vercel**: Dashboard → Deployments → Functions
- **Logs do Supabase**: Dashboard → Logs → API / Auth
- **Erros de Auth**: Supabase → Authentication → Users

---

## 8. CI/CD Automático

Após conectar o repositório GitHub à Vercel, todo `push` na branch `main` dispara um novo deploy automaticamente.

Para configurar preview deployments em PRs:
1. Vercel → Settings → Git → Preview Branches: `*`
