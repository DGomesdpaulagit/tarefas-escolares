# Project Instructions — Tarefas Escolares

Você é o engenheiro responsável pelo projeto **Tarefas Escolares**.
Este arquivo é lido automaticamente pelo Claude Code no início de cada sessão.

---

## AÇÃO IMEDIATA AO INICIAR QUALQUER CONVERSA

**Faça isso antes de responder qualquer coisa, sem esperar instrução:**

1. Leia `cloud.md` na raiz do projeto → identifique a sessão atual e o próximo passo
2. Leia `MEMORY.md` → confirme o estado do sistema
3. Verifique o último commit do git (`git log --oneline -3`)
4. Determine o número da próxima sessão (última sessão do cloud.md + 1)
5. Responda com este formato fixo:

```
📂 Projeto carregado: Tarefas Escolares v[versão]
📍 Última sessão: [Sessão X] - [título da última sessão do cloud.md]
📍 Último commit: [hash] — [mensagem]
🎯 Próxima sessão: [Sessão X+1] - [título baseado no próximo passo]

[descrição do que será feito]

Posso iniciar agora. Confirma?
```

Se o usuário disser "sim", "pode", "continua", "vai", "oi", ou qualquer coisa — execute sem mais perguntas.

---

## Localização do projeto

```
C:\Users\HP\Documents\Tarefas-Escolares-app (1)
```

Branch pessoal ativa (v3.0, módulo de Mesada + tutorial guiado): `v3-mesada-pessoal`.
Branch pública/estável (v2.1.0): `main`.

## URLs oficiais

- **Produção:** https://tarefas-escolares-five.vercel.app
- **GitHub:** https://github.com/DGomesdpaulagit/tarefas-escolares
- **Supabase:** https://supabase.com/dashboard/project/qnrrgkicsjdbrwhjelqn
- **Vercel:** https://vercel.com/davi-gomes-de-paula-s-projects/tarefas-escolares

---

## Regras obrigatórias durante o trabalho

- NUNCA remover código funcional
- NUNCA apagar arquivos sem necessidade
- NUNCA quebrar o build
- NUNCA fazer mudanças além do solicitado
- SEMPRE fazer alterações cirúrgicas e mínimas
- SEMPRE preservar o design Academic Dark (`#0f1117` / `#f59e0b`)

---

## CERTIFICAÇÃO APÓS AÇÕES IMPORTANTES

Após qualquer uma destas situações, atualize o MEMORY.md imediatamente e confirme ao usuário:

- Criação de arquivo novo (componente, página, serviço, doc)
- Edição relevante em arquivo existente
- Bug corrigido
- Sugestão aceita pelo usuário
- Decisão técnica tomada
- Feature implementada (mesmo que parcial)

**Formato da confirmação obrigatória após cada ação:**

```
📝 Registrado:
- MEMORY.md → [o que foi adicionado/atualizado]
- Obsidian → sincronizado automaticamente via Git
- [CHANGELOG.md / BUGS.md / PROMPTS.md] → [atualizado se relevante]
```

Não espere o final da sessão para registrar — registre logo após cada ação importante.
Se várias ações acontecerem em sequência, registre todas de uma vez ao final do bloco.

---

## CHECKLIST OBRIGATÓRIO AO FINAL DE CADA SESSÃO

Antes de encerrar, execute cada item abaixo e confirme com ✅ ou ❌:

```
VERIFICAÇÃO FINAL — execute cada comando e relate o resultado:

[ ] 1. npm run build                    → deve terminar com 0 erros
[ ] 2. cloud.md atualizado              → nova entrada [Sessão X] com resumo, problemas, próximo passo
[ ] 3. MEMORY.md atualizado             → estado atual, histórico, próximo passo (seção 22)
[ ] 4. CHANGELOG.md atualizado          → mudanças desta sessão registradas
[ ] 5. BUGS.md atualizado               → bugs corrigidos ou novos adicionados (se houver)
[ ] 6. PROMPTS.md atualizado            → prompts relevantes desta sessão (se houver)
[ ] 7. docs/ROADMAP.md atualizado       → status das fases reflete o trabalho feito
[ ] 8. git add . && git commit          → commit realizado com mensagem descritiva
[ ] 9. git push origin main             → push confirmado com hash do commit
[ ] 10. Vercel deploy disparado         → automático após o push (confirmar output do git push)
```

Só encerre a sessão após todos os itens estarem ✅.
Se algum item falhar, corrija antes de encerrar.

---

## Glossário de nomenclatura

- **Etapa** = uma conversa completa no Claude (uma janela/thread). Exemplo: Etapa 1, Etapa 2
- **Sessão** = um bloco de progresso dentro de uma Etapa. Exemplo: Sessão 1, Sessão 2

---

## Formato do resumo final obrigatório

Após o checklist, exiba sempre:

```
✅ [Etapa X / Sessão Y] encerrada — [data]

O que foi feito:
- [lista do que foi implementado/corrigido]

Arquivos modificados:
- [lista de arquivos]

Documentação atualizada:
- cloud.md → [Etapa X / Sessão Y] registrada
- MEMORY.md → estado e histórico atualizados
- [outros .md atualizados]

Build: ✅ 0 erros
Commit: [hash] — "[mensagem]"
Push: ✅ main → GitHub
Deploy: ✅ Vercel deploy automático disparado
Obsidian: ✅ sincronizado

Próxima etapa:
[Etapa X+1 / Sessão Y+1] - [título baseado no próximo passo]

💬 Sugestão de nome para esta conversa:
Etapa X - [resumo do que foi feito nesta conversa inteira]
```

A sugestão de nome deve cobrir **tudo que aconteceu na conversa inteira**, não só a última sessão.

---

## Stack do projeto

React 19 + TypeScript 5.6 + Vite 7 + Tailwind CSS v4 + shadcn/ui +
Supabase Auth + PostgreSQL + Wouter + Recharts + Framer Motion + Sonner + Vercel CI/CD

---

## Obsidian

O Vault do Obsidian aponta para a raiz deste projeto.
Atualizar qualquer `.md` aqui = atualiza automaticamente o Obsidian via Obsidian Git plugin.
Não é necessária nenhuma ação extra — o sync é automático.
