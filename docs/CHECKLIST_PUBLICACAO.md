# Checklist de Publicação — Tarefas Escolares

**Criado em:** 2026-07-24
**Propósito:** lista do que precisa ser feito **se e quando** o usuário decidir publicar o app para o público (Play Store, link público divulgado, etc.), em vez do uso pessoal atual.
**Status atual do app:** uso pessoal/privado. Nenhum item deste documento precisa ser feito agora — isso é um mapa para quando essa decisão for tomada, não uma lista de tarefas em andamento.

---

## Como usar este documento

Cada item tem: o que fazer, por quê, e o nível de esforço aproximado. Quando o usuário decidir publicar, a primeira ação é reler este documento inteiro com uma nova conversa e transformar os itens em um plano de execução — provavelmente nessa ordem: **Fundamentos → Segurança/Legal → Infraestrutura → Loja de apps**, porque os itens de segurança e legal bloqueiam os outros (não adianta preparar a Play Store se o app ainda expõe dado de um usuário para outro).

---

## 1. Fundamentos do produto (itens do usuário)

### 1.1 Retirar por inteiro a aba de Mesada
**O quê:** remover completamente o módulo de Mesada por Desempenho (`Mesada.tsx`, `MesadaContext`, `mesadaService`, tabelas `mesada_*`, item de menu, tutorial guiado que menciona a Mesada) da versão pública — não só desativar a feature flag.

**Por quê:** é dado financeiro sensível de um menor de idade (valores de mesada calculados a partir do desempenho escolar). Foi implementado *só* para uso pessoal, com o pai do usuário como único destinatário autorizado — nunca teve consentimento ou desenho pensado para uso por terceiros.

**Como (duas estratégias possíveis, decidir na hora):**
- **Reverter para a tag `v2.1.0-publico`** (commit `80adcd8`) como base da branch pública, e trazer por cima só as features não-Mesada desenvolvidas depois (i18n, v4.0, v5.0) — mais trabalhoso, mas garante que nenhum resquício de código da Mesada sobra no bundle público.
- **Deletar os arquivos e tabelas diretamente da branch atual** — mais rápido, mas exige checar todo import cruzado (o `subject_id` de `mesada_materias` referencia `subjects`, por exemplo) e revisar o tutorial guiado (`TourContext.tsx` tem passos específicos da Mesada).

Nos dois casos: **dropar as tabelas do banco de produção público** (`mesada_config`, `mesada_materias`, `mesada_notas`) se o projeto Supabase for compartilhado entre pessoal e público — ou, melhor, usar um projeto Supabase totalmente separado para a versão pública (ver seção 3.1).

**Esforço:** médio-alto, principalmente pela decisão de estratégia (reverter vs. deletar) e pela revisão do tutorial guiado.

### 1.2 Assinatura da API da Anthropic para a v5.0
**O quê:** configurar cobrança na conta Anthropic (ou trocar para outro provedor, ver observação) e configurar `ANTHROPIC_API_KEY` como secret de produção.

**Por quê:** a camada gratuita de qualquer provedor de IA de visão não aguenta uso por múltiplos usuários públicos simultâneos — o limite de 5 análises/dia por usuário multiplicado por muitos usuários vira custo real rapidamente.

**Observação importante:** hoje (Sessão 032, 2026-07-24) o usuário decidiu **não pagar** pela Anthropic para uso pessoal, e está avaliando trocar para o Google Gemini (camada gratuita real, sem cartão) enquanto o uso for só dele. **Se a troca para Gemini acontecer antes da publicação**, este item muda de "assinar Anthropic" para "avaliar se o volume público ainda cabe na camada gratuita do Gemini, ou se precisa virar conta paga do Google". Ou seja: revisar este item à luz de qual provedor estiver em uso no momento de publicar.

**Esforço:** baixo (é só configuração + orçamento), mas depende de uma decisão de custo recorrente que o usuário precisa aceitar conscientemente — diferente de todos os outros custos do projeto até aqui (Vercel, Supabase e Resend têm camadas gratuitas suficientes para o volume atual; uma API de IA de visão com uso público não tem uma camada gratuita que aguente escala imprevisível).

### 1.3 (espaço para os próximos itens que o usuário for adicionando)
Sempre que o usuário mencionar um novo item necessário para publicação, adicionar aqui nesta seção 1, numerado em sequência, com a mesma estrutura (o quê / por quê / como / esforço).

---

## 2. Segurança e privacidade (bloqueiam a publicação)

### 2.1 Auditoria de RLS completa
**O quê:** rodar uma auditoria de segurança em todas as tabelas do Supabase (`get_advisors` do MCP do Supabase é um bom primeiro passo) antes de expor o projeto a qualquer usuário desconhecido.

**Por quê:** todo o RLS até hoje foi desenhado e testado por um único usuário de confiança. Publicar significa que qualquer pessoa pode criar conta e tentar acessar dado de outra — um policy mal escrito que hoje é inofensivo (só o dono do projeto usa) vira uma brecha real.

**Atenção especial:** as tabelas `guardian_codes` (v4.0, sem nenhuma policy — inacessível ao cliente por design) e `image_analysis_usage` (v5.0, só leitura) precisam continuar exatamente assim; confirmar que nenhuma migration futura afrouxou isso.

### 2.2 Hardening de autenticação
**O quê:** confirmar que a confirmação de e-mail está obrigatória no cadastro (hoje, com um usuário só, pode estar relaxada), considerar CAPTCHA no cadastro/login (o Supabase Auth tem suporte nativo a hCaptcha/Turnstile), e revisar rate limits de tentativa de login.

**Por quê:** cadastro público sem essas proteções é alvo fácil de bots e criação de contas em massa.

### 2.3 LGPD e dados de menores de idade
**O quê:** política de privacidade publicada (obrigatória por lei no Brasil e exigida pela Play Store), e uma avaliação específica sobre o app coletar dado de possíveis menores de idade (ano escolar, desempenho, e-mail de responsável).

**Por quê:** a Lei Geral de Proteção de Dados (LGPD) tem regras mais rígidas para dados de crianças e adolescentes — em geral exige consentimento específico de um responsável legal, não bastando o consentimento do próprio usuário menor. O fluxo de "responsável" da v4.0 já pede o e-mail de um adulto, mas foi desenhado como *acompanhamento* (relatório informativo), não como *consentimento legal* para o tratamento de dados do menor — são coisas diferentes juridicamente.

**Recomendação:** isso é o item mais delicado da lista e o único que provavelmente exige orientação jurídica de verdade (não só decisão técnica) antes de publicar de fato, especialmente se o público-alvo natural do app (estudantes) inclui menores de 18 anos.

### 2.4 Página de exclusão de conta e dados
**O quê:** um fluxo (dentro do app ou uma página web pública) para o usuário apagar a própria conta e todos os dados associados.

**Por quê:** é exigência formal da Google Play (Data Safety / Account Deletion policy) desde 2023 para qualquer app que permita criar conta — precisa existir mesmo que o app não seja publicado na Play Store, só como link público, para atender LGPD/GDPR.

### 2.5 Remover dados pessoais hardcoded do código
**O quê:** revisar o código em busca de dados pessoais do usuário atual fixos no código-fonte. Já identificado: `VAPID_SUBJECT = "mailto:daviphone22@gmail.com"` em `supabase/functions/send-notifications/index.ts` — hoje é o contato técnico do push, mas numa versão pública devia ser um e-mail de suporte genérico do app, não o e-mail pessoal do desenvolvedor.

**Por quê:** expor o e-mail pessoal do desenvolvedor no código/infra de um app público é um risco de privacidade e spam desnecessário.

---

## 3. Infraestrutura (separação pessoal × pública)

### 3.1 Ambiente de produção separado
**O quê:** decidir entre (a) um projeto Supabase novo dedicado à versão pública, com seu próprio banco, secrets e Storage, ou (b) manter um único projeto com isolamento lógico mais rígido (schemas separados, RLS mais restrito).

**Por quê:** hoje pessoal e "produção" são o mesmo projeto Supabase (`qnrrgkicsjdbrwhjelqn`). Misturar dado real de terceiros desconhecidos com o ambiente onde o usuário testa e depura é arriscado — um teste malfeito pode vazar ou corromper dado de um usuário público real. A opção (a) é mais segura e mais simples de raciocinar sobre, ao custo de manter dois projetos.

### 3.2 Domínio próprio verificado no Resend
**O quê:** comprar um domínio (a estimativa registrada na spec da v4.0 é de ~R$40/ano) e verificá-lo no Resend, substituindo o domínio de teste `onboarding@resend.dev`.

**Por quê:** o domínio de teste só entrega e-mail para o dono da conta Resend — inútil para relatórios de responsáveis reais de usuários públicos diferentes.

### 3.3 Monitoramento e alertas de custo
**O quê:** configurar alertas de gasto no Vercel, Supabase, Resend e no provedor de IA de visão (qualquer que seja), e considerar uma ferramenta de monitoramento de erros (ex: Sentry) para saber quando algo quebra em produção sem depender de um usuário reportar.

**Por quê:** hoje, com um usuário só, um erro ou pico de custo é percebido na hora (é o próprio usuário usando). Com usuários públicos desconhecidos, um problema pode passar despercebido por dias.

### 3.4 Backups e recuperação de desastre
**O quê:** confirmar que o plano do Supabase em uso tem backup automático adequado (Point-in-Time Recovery, se o volume de dados justificar), e testar ao menos uma vez um processo de restauração.

**Por quê:** perder dado de um usuário público desconhecido (sem como pedir pra ele re-cadastrar tudo) é bem mais grave do que perder dado de teste do próprio desenvolvedor.

---

## 4. Loja de aplicativos e distribuição

### 4.1 Política de privacidade e termos de uso publicados
**O quê:** páginas públicas de Política de Privacidade e Termos de Uso, com URL estável (exigido tanto pela Play Store quanto pela LGPD).

### 4.2 Formulário de Data Safety (Google Play)
**O quê:** preencher o formulário de segurança de dados da Play Store, declarando exatamente quais dados o app coleta (e-mail, nome, ano escolar, e-mail de responsável, fotos temporárias para análise de IA) e para quê.

**Nota:** o fato de a v5.0 apagar a foto do Storage logo após a análise (decisão tomada na Sessão 031) é um ponto positivo real para esse formulário — "não retemos a imagem enviada" é uma declaração de privacidade mais forte do que a maioria dos apps consegue fazer.

### 4.3 Ícone, screenshots e ficha da loja
**O quê:** material visual (ícone em várias resoluções, screenshots do app, descrição curta/longa) exigido pela Play Store.

### 4.4 Decisão de empacotamento
**O quê:** decidir entre publicar como PWA instalável (o app já suporta isso) via Trusted Web Activity (TWA) — caminho mais simples e barato para entrar na Play Store — ou desenvolver um wrapper nativo (ex: Capacitor) se precisar de recursos que PWA não oferece bem no Android/iOS.

**Por quê:** o app já é PWA-instalável hoje; TWA é o caminho de menor esforço para ir da Play Store a partir daí, mas vale confirmar que cobre as necessidades (notificações push já funcionam via Web Push, por exemplo).

---

## 5. Operação contínua

### 5.1 Canal de suporte
**O quê:** um e-mail ou formulário de contato para usuários reportarem bugs ou pedirem ajuda — não pode ser mais o WhatsApp/contato pessoal do desenvolvedor à disposição de estranhos.

### 5.2 Plano de resposta a incidentes
**O quê:** um mínimo de processo definido para quando algo der errado em produção com usuários reais (ex: vazamento de dado, downtime prolongado) — nem que seja só "quem eu aviso e o que eu faço primeiro".

---

## Itens explicitamente fora de escopo deste documento

- Modelo de monetização (o app é gratuito hoje; se isso mudar, precisa de um documento próprio sobre isso, incluindo implicações fiscais)
- Escala de infraestrutura além do necessário para uma base de usuários pequena/inicial — otimização de performance para milhares de usuários simultâneos não é uma preocupação de dia 1
