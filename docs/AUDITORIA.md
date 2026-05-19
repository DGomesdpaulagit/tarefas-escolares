# Auditoria do Projeto — Tarefas Escolares

**Data:** 2026-05-19  
**Versão auditada:** 1.0.0 (gerada com Manus AI)

---

## 1. Resumo Executivo

O projeto foi gerado pelo Manus AI e possui arquitetura parcialmente funcional. O frontend React funciona, mas há contaminação significativa de artefatos da plataforma Manus, autenticação apenas local via `localStorage` e uma camada de servidor com imports quebrados para bibliotecas não instaladas.

---

## 2. Artefatos Manus AI Identificados

### 2.1 Arquivos a Remover

| Arquivo | Motivo |
|---|---|
| `client/public/__manus__/debug-collector.js` | Script de coleta de logs do Manus |
| `client/public/__manus__/version.json` | Metadados da plataforma Manus |
| `client/src/components/ManusDialog.tsx` | Diálogo de login "Login with Manus" |
| `client/src/components/Map.tsx` | Google Maps via proxy Forge/Manus — não usado no app |
| `client/src/const.ts` | Exporta URL OAuth e AppID do Manus |
| `COMECE_AQUI.md` | Guia gerado pelo Manus |
| `GUIA_GITHUB_DOWNLOAD.md` | Guia gerado pelo Manus |
| `template.json` | Metadados do template Manus |
| `.project-config.json` | Configuração da plataforma Manus |
| `patches/wouter@3.7.1.patch` | Patch aplicado pelo Manus (desnecessário) |

### 2.2 Arquivos a Modificar

| Arquivo | Problema | Ação |
|---|---|---|
| `vite.config.ts` | Contém `vitePluginManusRuntime`, `vitePluginManusDebugCollector`, `vitePluginStorageProxy`, `allowedHosts` com domínios manus, referências a `.manus-logs` | Reescrever sem Manus |
| `package.json` | `vite-plugin-manus-runtime`, `@builder.io/vite-plugin-jsx-loc` | Remover dependências Manus |
| `shared/const.ts` | `COOKIE_NAME` para OAuth do Manus | Remover |

### 2.3 Dependências Manus no package.json

```json
"vite-plugin-manus-runtime": "^0.0.57"  // DEV
"@builder.io/vite-plugin-jsx-loc": "^0.1.1"  // DEV
```

---

## 3. Arquivos Vazios / Sem Uso

| Arquivo | Status |
|---|---|
| `server/db.ts` | Importa `drizzle-orm/mysql2` e `../drizzle/schema` — módulos não instalados. Servidor não utilizado pelo frontend. |
| `server/routers.ts` | Importa `trpc`, `protectedProcedure` — não instalados. Não utilizado. |
| `shared/const.ts` | Apenas constantes OAuth do Manus |
| `client/src/hooks/usePersistFn.ts` | Usado apenas pelo Map.tsx (removido) |
| `client/src/const.ts` | OAuth do Manus — não utilizado pelo app |

---

## 4. Código Redundante / Problemas Estruturais

### 4.1 Autenticação Insegura
- `AuthContext.tsx` usa "hash" CRC32 (não é criptografia). Senhas legíveis se o localStorage for comprometido.
- Dados de login sincronizados apenas localmente.
- `LimparTarefasModal.tsx` reimplementa o algoritmo de hash do AuthContext — acoplamento frágil.

### 4.2 IDs Inconsistentes
- `Tarefa.id` é do tipo `number`, gerado com `Date.now() * 1000 + counter`. Problemático com Supabase (UUID).

### 4.3 Servidor Express Inutilizado
- `server/index.ts` existe mas não é usado em desenvolvimento (Vite serve o frontend).
- Com Supabase, o servidor pode ser totalmente removido.

### 4.4 Campo `diasRestantes` Calculado Incorretamente
- `diasRestantes` é calculado no momento da criação da tarefa e armazenado estaticamente. Deveria ser calculado em tempo real.

### 4.5 Filtro de Matéria não Sincronizado
- O select de matérias no formulário é hardcoded. Não reflete matérias personalizadas pelo usuário.

---

## 5. Dependências Não Utilizadas

| Pacote | Motivo |
|---|---|
| `axios` | Nenhuma chamada HTTP no frontend (tudo é localStorage) |
| `streamdown` | Sem uso aparente no código |
| `express` | Servidor não utilizado em produção |
| `embla-carousel-react` | Sem uso |
| `@types/google.maps` | Só usado por Map.tsx (removido) |

---

## 6. Funcionalidades Faltantes

| Funcionalidade | Status |
|---|---|
| Supabase Auth | ❌ Não implementado |
| Banco de dados online | ❌ Apenas localStorage |
| Sincronização entre dispositivos | ❌ |
| Recuperação de senha | ❌ |
| Página de Configurações | ❌ |
| Agenda/Calendário | ❌ |
| Internacionalização (i18n) | ❌ |
| Tema claro/escuro persistido | ❌ Não persistido no banco |
| Urgência automática (≤3 dias) | ❌ Parcialmente (cor no diasRestantes) |
| Notificações | ❌ |
| Perfil analítico | ❌ |
| Export JSON/CSV | ❌ Apenas import |
| Testes | ❌ |

---

## 7. Bugs Identificados

1. **`diasRestantes` estático**: calculado na criação, não atualizado. Uma tarefa criada há 30 dias com prazo amanhã mostrará o valor calculado há 30 dias.
2. **Filtro de matéria na sidebar** não sincroniza com o select na página de tarefas quando limpa filtros.
3. **`LimparTarefasModal`** verifica senha usando hash recalculado, mas a senha no `usuario` objeto inclui o hash original. Com Supabase, isso deve usar re-autenticação.
4. **`server/routers.ts`** importa `_core/trpc` que não existe — build do servidor quebraria.

---

## 8. Recomendações de Ação

### Crítico (Etapa 1)
- [x] Remover todos os artefatos Manus AI
- [x] Reescrever `vite.config.ts`
- [x] Remover dependências Manus do `package.json`

### Alta Prioridade (Etapas 4-8)
- [x] Integrar Supabase Auth
- [x] Migrar dados para Supabase PostgreSQL
- [x] Criar camada de serviços
- [x] Refatorar contexts

### Média Prioridade (Etapas 9-14)
- [x] Melhorias mobile
- [x] Novas funcionalidades (urgência, tema, configurações, agenda)
- [x] i18n
- [x] Backup/exportação
- [x] Testes

### Baixa Prioridade (Etapas 15-17)
- [x] Documentação completa
- [x] Deploy (Vercel)
