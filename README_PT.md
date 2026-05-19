# 📚 Tarefas Escolares - App de Gerenciamento de Tarefas

Um aplicativo web moderno para gerenciar tarefas escolares com autenticação por email, importação de planilhas e visualização de métricas.

## 🌟 Características

### 🔐 Autenticação
- Login e cadastro com email e senha
- Dados persistentes por usuário
- Sessão salva no localStorage
- Menu de usuário com opção de logout

### 📝 Gerenciamento de Tarefas
- Criar, editar e deletar tarefas
- Adicionar descrição, link e observações
- Definir prioridade (Alta, Média, Baixa)
- Acompanhar progresso (0-100%)
- Marcar como concluída
- Filtrar por status, matéria e prioridade
- Buscar tarefas por nome

### 📊 Métricas e Gráficos
- Visualizar progresso geral
- Gráficos de distribuição por status
- Estatísticas por matéria e setor
- KPIs de tarefas concluídas, pendentes, atrasadas

### 📤 Importação de Planilhas
- Importar tarefas de arquivos Excel/CSV
- Preview antes de confirmar
- Histórico de importações
- Remover importações antigas

### 🗑️ Proteção com Senha
- Limpar todas as tarefas requer senha
- Confirmação de segurança
- Previne exclusões acidentais

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ ou npm 9+
- Git (para clonar o repositório)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu_usuario/tarefas-escolares-app.git
cd tarefas-escolares-app
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no navegador:
```
http://localhost:5173
```

## 📖 Como Usar

### Criar uma Conta
1. Clique em "Cadastre-se"
2. Preencha email, nome e senha (mínimo 6 caracteres)
3. Clique em "Criar conta"

### Fazer Login
1. Digite seu email e senha
2. Clique em "Entrar"

### Adicionar Tarefa
1. Clique em "+ Nova Tarefa"
2. Preencha os dados (matéria, descrição, data, etc)
3. Clique em "Salvar"

### Importar Planilha
1. Clique em "Importar"
2. Arraste um arquivo Excel/CSV ou clique para selecionar
3. Revise as tarefas encontradas
4. Clique em "Importar" para confirmar

### Limpar Tarefas
1. Clique em "Limpar"
2. Digite sua senha
3. Clique em "Limpar tudo"

### Visualizar Métricas
1. Clique em "Métricas" no sidebar
2. Veja gráficos e estatísticas
3. Role para ver todos os gráficos

## 🛠️ Estrutura do Projeto

```
tarefas-escolares-app/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx          # Página de autenticação
│   │   │   ├── Home.tsx           # Layout principal
│   │   │   ├── Tarefas.tsx        # Gerenciamento de tarefas
│   │   │   ├── Metricas.tsx       # Gráficos e estatísticas
│   │   │   └── Arquivos.tsx       # Histórico de importações
│   │   ├── components/
│   │   │   ├── TarefaCard.tsx     # Card de tarefa
│   │   │   ├── TarefaForm.tsx     # Formulário de tarefa
│   │   │   ├── Sidebar.tsx        # Barra lateral
│   │   │   ├── UserMenu.tsx       # Menu do usuário
│   │   │   ├── LimparTarefasModal.tsx # Modal de limpeza
│   │   │   ├── ImportarPlanilhaModal.tsx # Modal de importação
│   │   │   └── HistoricoArquivos.tsx # Histórico
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx    # Contexto de autenticação
│   │   │   ├── TarefasContext.tsx # Contexto de tarefas
│   │   │   └── ArquivosContext.tsx # Contexto de arquivos
│   │   ├── lib/
│   │   │   ├── tarefasData.ts     # Dados e tipos
│   │   │   └── parseExcel.ts      # Parser de Excel/CSV
│   │   ├── App.tsx                # Componente raiz
│   │   ├── main.tsx               # Ponto de entrada
│   │   └── index.css              # Estilos globais
│   ├── public/                    # Arquivos estáticos
│   └── index.html                 # HTML principal
├── package.json                   # Dependências
├── vite.config.ts                 # Configuração Vite
├── tsconfig.json                  # Configuração TypeScript
└── README.md                       # Este arquivo
```

## 🎨 Design

- **Tema:** Academic Dark
- **Cores:** Fundo escuro (#0f1117), Acentos âmbar (#f59e0b)
- **Tipografia:** Space Grotesk (títulos), Inter (corpo)
- **Componentes:** shadcn/ui + Tailwind CSS 4

## 📦 Dependências Principais

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilos
- **Vite** - Build tool
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos
- **Sonner** - Notificações
- **Wouter** - Roteamento
- **xlsx** - Parser de Excel

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build para produção
npm run preview      # Visualiza o build

# Verificação
npm run check        # Verifica erros de TypeScript
npm run format       # Formata código com Prettier

# Testes
npm run test         # Executa testes (se configurado)
```

## 💾 Armazenamento de Dados

Todos os dados são armazenados no **localStorage** do navegador:

- `tarefas-escolares-v1` - Lista de tarefas
- `tarefas_usuario` - Dados do usuário autenticado
- `tarefas_usuarios_db` - Banco de usuários
- `tarefas_arquivos` - Histórico de importações

**Nota:** Os dados são locais ao navegador. Para sincronizar entre dispositivos, considere usar um backend.

## 🔒 Segurança

- Senhas são hasheadas (hash simples para demo)
- Dados salvos localmente (não enviados a servidores)
- Proteção com senha para operações críticas
- Validação de entrada em formulários

**⚠️ Aviso:** Este é um projeto de demonstração. Para produção, implemente:
- Autenticação segura com backend
- Criptografia de senhas com bcrypt
- Banco de dados persistente
- HTTPS obrigatório

## 📱 Responsividade

O app é totalmente responsivo:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (até 767px)

## 🌐 Publicação

### Publicar no Manus
1. Clique em "Publish" no painel de management
2. Seu app estará disponível em: `tarefasapp-gaw9xmmx.manus.space`

### Exportar para GitHub
1. Vá para Settings → GitHub
2. Conecte sua conta GitHub
3. Clique em "Exportar para GitHub"
4. Seu repositório será criado automaticamente

### Deploy em Outro Servidor
```bash
# Build
npm run build

# Os arquivos estão em dist/
# Faça upload para seu servidor
```

## 🐛 Troubleshooting

### Problema: Dados desaparecem após fechar o navegador
**Solução:** Os dados estão no localStorage. Limpar cache/cookies remove os dados. Use um backend para persistência real.

### Problema: Importação de planilha não funciona
**Solução:** Verifique se o arquivo é Excel (.xlsx) ou CSV. Certifique-se que tem as colunas esperadas.

### Problema: Senha não funciona
**Solução:** A senha deve ter mínimo 6 caracteres. Certifique-se de estar digitando corretamente.

## 📝 Licença

MIT License - Veja LICENSE para detalhes

## 🤝 Contribuições

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique o arquivo `COMECE_AQUI.md`
2. Leia o `GUIA_GITHUB_DOWNLOAD.md`
3. Abra uma issue no GitHub

## 🎯 Roadmap

- [ ] Backend com Node.js/Express
- [ ] Banco de dados (PostgreSQL/MongoDB)
- [ ] Autenticação OAuth (Google, GitHub)
- [ ] Sincronização em tempo real
- [ ] Notificações de prazos
- [ ] Compartilhamento de tarefas
- [ ] Modo offline
- [ ] App mobile (React Native)
- [ ] Integração com Google Calendar
- [ ] Exportar para PDF

## 🙏 Agradecimentos

Desenvolvido com ❤️ usando:
- Manus AI Platform
- React Community
- shadcn/ui
- Tailwind CSS Team

---

**Versão:** 1.0.0  
**Última atualização:** Maio 2026  
**Status:** ✅ Pronto para uso

Divirta-se organizando suas tarefas! 🚀
