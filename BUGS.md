# Bugs — Tarefas Escolares

Registro de bugs resolvidos e bugs conhecidos/pendentes.

---

## Bugs Resolvidos

### BUG-016 — Importação de planilha retornando erro 400
- **Arquivo:** `client/src/lib/parseExcel.ts`, `client/src/components/ImportarPlanilhaModal.tsx`
- **Causa 1:** valores de `status`/`priority` da planilha não batiam com os enums do Supabase (`"done"` ≠ `"Concluída"`)
- **Causa 2:** datas do Excel chegavam como número serial (ex: `45672`) em vez de string `YYYY-MM-DD`
- **Solução:** funções `sanitizeStatus()`, `sanitizePrioridade()` (mapeamento PT/EN) e `parseExcelDate()` (conversão serial → ISO)
- **Status:** ✅ Resolvido em 2026-05-21 — commit `4e32f37`

---

### BUG-017 — Avatar upload falhando (406 / "Erro ao processar imagem")
- **Arquivo:** `client/src/services/profileService.ts`, `client/src/pages/Configuracoes.tsx`
- **Causa 1:** bucket `avatars` não existia no Supabase Storage → upload falhava com 400/406
- **Causa 2:** linha do perfil não existia na tabela `profiles` (conta criada antes do trigger `on_auth_user_created`) → PATCH falhava com 406
- **Solução 1:** avatar agora usa Canvas API para comprimir (256×256 JPEG) e salva base64 em `profiles.avatar_url` — sem depender de Storage
- **Solução 2:** `profileService.get()` usa `.maybeSingle()`; todos os writes usam `upsert` em vez de `update`
- **Solução 3 (definitiva):** linha do perfil criada manualmente via SQL no Supabase Dashboard
- **Status:** ✅ Resolvido em 2026-05-21 — commits `725c09a`, `68c446c`, `b50dc3b`, `bdd49d0`

---

### BUG-018 — notification_settings retornando 409 (conflito)
- **Arquivo:** `client/src/services/settingsService.ts`
- **Causa:** `upsert` sem `onConflict` tentava INSERT duplicado quando já havia registro para o `user_id`
- **Solução:** `{ onConflict: "user_id" }` adicionado ao `upsertNotifications()`
- **Status:** ✅ Resolvido em 2026-05-21 — commit `725c09a`

---

### BUG-001 — `Cannot find module './usePersistFn'`
- **Arquivo:** `client/src/hooks/useComposition.ts`
- **Causa:** `usePersistFn.ts` foi deletado durante a limpeza Manus AI, mas o import permaneceu.
- **Solução:** Reescrever `useComposition.ts` substituindo as 4 chamadas por `useCallback` nativo do React.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-002 — `Type 'void' is not assignable to type 'Promise<void>'`
- **Arquivo:** `client/src/contexts/AuthContext.tsx`
- **Causa:** Supabase v2 `onAuthStateChange` espera callback `async`, mas o callback era síncrono.
- **Solução:** Adicionar `async` ao callback: `onAuthStateChange(async (event, session) => {...})`.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-003 — `subject_id` ausente em TarefaInsert
- **Arquivo:** `client/src/components/TarefaForm.tsx`
- **Causa:** O estado inicial do formulário não incluía `subject_id`, campo requerido pelo tipo `TarefaInsert`.
- **Solução:** Adicionar `subject_id: tarefa?.subject_id ?? null` ao estado inicial.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-004 — `never[]` em todos os retornos de serviços Supabase
- **Arquivo:** `client/src/supabase/client.ts` e todos os services
- **Causa:** `createClient<Database>` com tipo `Database` escrito à mão não correspondia à estrutura genérica esperada pelo Supabase JS, fazendo `.insert()`, `.update()` e `.upsert()` retornarem `never`.
- **Solução:** Remover o generic `<Database>` de `createClient(url, key)`. Os services usam `as Tarefa[]` para tipagem.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-005 — `Cannot find module 'next-themes'`
- **Arquivo:** `client/src/components/ui/sonner.tsx`
- **Causa:** `next-themes` foi removido do `package.json` mas o import permaneceu no componente.
- **Solução:** Remover o import e o `useTheme()`. Hardcodar `theme="dark"` pois o app usa Academic Dark fixo.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-006 — `%VITE_ANALYTICS_ENDPOINT% is not defined`
- **Arquivo:** `client/index.html`
- **Causa:** Script de analytics do Manus AI referenciava variável de ambiente não definida.
- **Solução:** Remover o bloco `<script defer src="%VITE_ANALYTICS_ENDPOINT%/umami" ...>` inteiro.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-007 — `Can't resolve 'tw-animate-css'`
- **Arquivo:** `client/src/index.css`
- **Causa:** Pacote `tw-animate-css` não existe. O correto é `tailwindcss-animate`, e no Tailwind v4 usa-se `@plugin` e não `@import`.
- **Solução:** Substituir `@import "tw-animate-css"` por `@plugin "tailwindcss-animate"`.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-008 — 14 componentes shadcn/ui com imports quebrados
- **Arquivos:** `aspect-ratio.tsx`, `carousel.tsx`, `command.tsx`, `context-menu.tsx`, `drawer.tsx`, `hover-card.tsx`, `input-otp.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `radio-group.tsx`, `resizable.tsx`, `slider.tsx`, `toggle-group.tsx`, `toggle.tsx`
- **Causa:** Pacotes como `embla-carousel-react`, `cmdk`, `vaul`, `input-otp` foram removidos do `package.json` mas os componentes permaneceram.
- **Solução:** Deletar todos os 14 arquivos (não eram usados em nenhum componente real).
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-009 — `pnpm install` falhando no CI Vercel
- **Arquivo:** `vercel.json`
- **Causa:** Presença do `pnpm-lock.yaml` fez a Vercel usar pnpm@10.4.1, que não estava disponível.
- **Solução:** Criar `vercel.json` com `"installCommand": "npm install"` para forçar npm.
- **Status:** ✅ Resolvido em 2026-05-19

---

### BUG-010 — Tela preta em produção — variáveis de ambiente
- **URL:** https://tarefas-escolares-five.vercel.app
- **Causa:** Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` passadas via `--env` no CLI do Vercel não foram persistidas no projeto. Build sem as vars resulta em erro fatal na inicialização.
- **Solução:** Usar a Vercel API (POST `/v9/projects/{id}/env`) com token para salvar as variáveis permanentemente nos targets `production`, `preview` e `development`.
- **Status:** ✅ Resolvido em 2026-05-20

---

### BUG-011 — Reset de senha abre página em branco
- **Causa:** Rota `/reset-password` não existia. O Supabase envia o link com hash fragment (`#access_token=...&type=recovery`), que precisa ser processado pelo `onAuthStateChange`.
- **Solução:** Criar `client/src/pages/ResetPassword.tsx` que:
  1. Escuta `onAuthStateChange` pelo evento `PASSWORD_RECOVERY`
  2. Ao receber sessão, exibe formulário de nova senha
  3. Após sucesso, faz logout e redireciona para login
  - Adicionar rota `/reset-password` no `App.tsx` (tanto no branch autenticado quanto no não-autenticado).
- **Status:** ✅ Resolvido em 2026-05-20

---

### BUG-012 — Vercel deploy rejeitando nome com parênteses
- **Causa:** Pasta local `tarefas-escolares-app (1)` foi usada como nome do projeto Vercel, e parênteses são inválidos.
- **Solução:** Passar flag `--name tarefas-escolares` explicitamente no `vercel deploy`.
- **Status:** ✅ Resolvido em 2026-05-19

---

## Bugs Conhecidos / Pendentes

### BUG-013 — Express server inativo (`server/index.ts`)
- **Severidade:** Baixa (não afeta o app)
- **Descrição:** O arquivo `server/index.ts` existe mas não é usado. O app é puramente frontend (SPA). O servidor Express é código morto do template original.
- **Status:** ⚠️ Conhecido — não impacta funcionalidade, pode ser removido futuramente

---

### BUG-014 — Filtros sem legendas visuais
- **Severidade:** UX menor
- **Descrição:** Os Select de filtro em `Tarefas.tsx` não têm labels acima deles — o usuário precisa abrir para saber o que cada um filtra.
- **Status:** 🔜 Pendente (Fase 1)

---

### BUG-015 — Tarefas urgentes não são priorizadas na listagem
- **Severidade:** UX menor
- **Descrição:** Tarefas com prazo ≤ 3 dias aparecem com badge "Urgente" mas não sobem automaticamente para o topo da lista.
- **Status:** ✅ Resolvido (Sessão 017 — buckets de ordenação)

---

### BUG-016 — Cálculo de dias restantes incorreto (timezone bug)
- **Severidade:** ALTA — afeta lógica central
- **Descrição:** `new Date("YYYY-MM-DD")` era interpretado como UTC midnight; em UTC-3 (Brasília) virava 21h do dia anterior. Após `setHours(0,0,0,0)` ficava o dia anterior, resultando em "Faltam 7 dias" quando o correto era 8. Tarefas expiravam 1 dia antes.
- **Status:** ✅ Resolvido (Sessão 017 — `parseDueDateLocal` em `lib/tarefasData.ts`)

### BUG-017 — Tarefas com prazo vencido podiam ser marcadas como concluídas
- **Severidade:** ALTA — quebra integridade lógica
- **Descrição:** Após o prazo, o botão "concluir" continuava ativo, permitindo conclusão fora do prazo. Status visual também não refletia expiração automaticamente.
- **Status:** ✅ Resolvido (Sessão 017 — `getStatusEfetivo`, `toggleConcluida` bloqueia expiradas, card com visual dedicado)

### BUG-018 — Tarefas expiradas continuavam no topo da lista
- **Severidade:** UX média
- **Descrição:** Sem ordenação por status efetivo, expiradas poluíam a área prioritária da listagem.
- **Status:** ✅ Resolvido (Sessão 017 — buckets: urgentes → normais → concluídas → expiradas)

### BUG-019 — Textos invisíveis em light mode
- **Severidade:** Média — afeta legibilidade no tema claro
- **Descrição:** Componentes usavam `text-slate-100`/`text-white`/`bg-white/5` diretamente, ficando invisíveis em fundo claro.
- **Status:** ✅ Resolvido (Sessão 017 — overrides CSS `html:not(.dark)` em `index.css`)

---

*Atualizado em: 2026-05-28*
