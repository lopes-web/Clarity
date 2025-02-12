# Clarity - Sistema de Gestão Acadêmica

## Sobre o Projeto

Clarity é um sistema de gestão acadêmica moderno e intuitivo, projetado para ajudar estudantes a gerenciar suas atividades acadêmicas de forma eficiente e engajadora. O projeto combina funcionalidades práticas com elementos de gamificação para tornar a organização dos estudos mais divertida e motivadora.

### Principais Funcionalidades

1. **Gestão de Disciplinas**
   - Cadastro e acompanhamento de disciplinas
   - Registro de notas e frequência
   - Cálculo automático de médias
   - Visualização do progresso por disciplina

2. **Sistema de Tarefas**
   - Criação e gerenciamento de tarefas acadêmicas
   - Integração com Google Tasks
   - Lembretes e notificações
   - Categorização por tipo (provas, trabalhos, projetos)

3. **Calendário Acadêmico**
   - Visualização mensal de atividades
   - Sincronização com Google Calendar
   - Organização visual por tipos de evento
   - Acompanhamento de prazos

4. **Sistema de Gamificação**
   - Conquistas baseadas em desempenho
   - Sistema de níveis e XP
   - Recompensas por metas alcançadas
   - Feedback visual de progresso

### Tecnologias Utilizadas

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Autenticação)
- **Integrações**: Google Tasks API, Google Calendar API
- **Deploy**: Vercel

### Como Usar

1. Faça login ou crie uma conta
2. Configure suas disciplinas do semestre
3. Adicione suas tarefas e compromissos
4. Acompanhe seu progresso e conquistas
5. Sincronize com Google Tasks (opcional)

## 1. Configuração Inicial do Projeto

### 1.1 Tecnologias Principais
- React + TypeScript
- Vite como bundler
- TailwindCSS para estilização
- Shadcn/UI para componentes
- React Router para navegação

### 1.2 Configuração do Ambiente
- Configuração do TypeScript
- Configuração do Vite
- Configuração do TailwindCSS
- Configuração do ESLint e Prettier

## 2. Implementação da Interface Base

### 2.1 Componentes Base
- Layout principal com sidebar
- Sistema de navegação
- Footer com links para políticas
- Sistema de tabs para navegação interna

### 2.2 Páginas Principais
- Dashboard (página inicial)
- Calendário
- Política de Privacidade
- Termos de Serviço

## 3. Integração com Google Tasks

### 3.1 Configuração do Google OAuth
- Configuração do projeto no Google Cloud Console
- Implementação do sistema de autenticação OAuth
- Configuração das credenciais e escopos:
  ```env
  VITE_GOOGLE_CLIENT_ID="711017287148-88j0134kof4jabml2j5b105l078vqoeg.apps.googleusercontent.com"
  ```
- Habilitação da API do Google Tasks

### 3.2 Funcionalidades do Google Tasks
- Criação de lista de tarefas "Clarity"
- Adição de tarefas acadêmicas
- Atualização de status de conclusão
- Exclusão de tarefas
- Sincronização bidirecional de status
- Persistência do token de acesso

### 3.3 Integração com o App
- Sincronização automática a cada 5 minutos
- Atualização em tempo real do status de conclusão
- Tratamento de erros e feedback ao usuário
- Modo offline com persistência local

## 4. Sistema de Eventos/Tarefas

### 4.1 Gerenciamento de Estado
- Implementação do EventProvider
- Sistema de armazenamento local
- Sincronização com Google Tasks
- Mapeamento entre eventos locais e tarefas do Google

### 4.2 Funcionalidades de Eventos
- Criação de eventos como tarefas
- Edição de eventos/tarefas
- Exclusão de eventos/tarefas
- Marcação de conclusão sincronizada
- Filtros e ordenação

## 5. Sistema de Autenticação com Supabase

### 5.1 Configuração do Supabase
- Criação do projeto no Supabase
- Configuração das credenciais:
  ```env
  VITE_SUPABASE_URL="https://fzmxgtyhalwzeaqyzeoa.supabase.co"
  VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```

### 5.2 Esquema do Banco de Dados
- Tabela de perfis de usuários
- Políticas de segurança (RLS)
- Triggers para criação automática de perfil

### 5.3 Sistema de Autenticação
- Registro de usuários com:
  - Nome
  - Email
  - Senha
- Login com email/senha
- Logout
- Proteção de rotas
- Persistência de sessão

## 6. Funcionalidades do Dashboard

### 6.1 Gerenciamento de Disciplinas
- Adição de disciplinas
- Edição de disciplinas
- Exclusão de disciplinas
- Registro de notas
- Controle de faltas

### 6.2 Visualização de Dados
- Cards de métricas
- Lista de disciplinas
- Próximas tarefas
- Status geral

## 7. Funcionalidades do Calendário

### 7.1 Interface do Calendário
- Visualização mensal
- Lista de tarefas do dia
- Próximas tarefas
- Indicadores visuais de tarefas

### 7.2 Gerenciamento de Tarefas
- Adição de tarefas acadêmicas
- Tipos de tarefas:
  - Prova
  - Trabalho
  - Projeto
  - Aula
  - Outro
- Sincronização com Google Tasks
- Status de conclusão bidirecional

## 8. Melhorias de UX/UI

### 8.1 Feedback Visual
- Sistema de toast notifications
- Indicadores de carregamento
- Estados de erro
- Confirmações de ações
- Microinterações e animações:
  - Hover effects em cards e botões
  - Transições suaves em elementos interativos
  - Feedback visual em ações do usuário
  - Animações de escala e transformação
  - Cores dinâmicas para status e prioridades

### 8.2 Responsividade
- Layout adaptativo
- Sidebar responsiva
- Cards responsivos
- Calendário responsivo
- Grid system otimizado para diferentes telas

### 8.3 Melhorias de UI
- Esquema de cores atualizado:
  - Tons de roxo e rosa para tags e status
  - Cores personalizadas para tipos de atividades
  - Gradientes e transparências para profundidade visual
- Cards redesenhados:
  - Sombras e elevações sutis
  - Bordas suaves e cantos arredondados
  - Estados hover aprimorados
  - Remoção de elementos visuais desnecessários
- Tipografia aprimorada:
  - Hierarquia clara de textos
  - Espaçamento otimizado
  - Fonte Figtree para melhor legibilidade

## 9. Segurança

### 9.1 Proteção de Dados
- Variáveis de ambiente
- Tokens seguros
- Row Level Security no Supabase
- Validação de formulários

### 9.2 Autenticação
- Proteção de rotas
- Gerenciamento de sessão
- Renovação de tokens
- Logout automático

## 10. Próximos Passos

### 10.1 Melhorias Planejadas
- Implementação de testes
- PWA (Progressive Web App)
- Modo offline aprimorado
- Notificações push
- Compartilhamento de tarefas

### 10.2 Backlog
- Sistema de lembretes
- Exportação de dados
- Temas personalizados
- Integração com outros serviços
- Sistema de backup

## 11. Sistema de Gamificação

### 11.1 Sistema de Conquistas
- Implementação de achievements
- Diferentes tipos de conquistas:
  - Notas e desempenho acadêmico
  - Assiduidade e presença
  - Conclusão de tarefas
  - Sequências de estudo
  - Conquistas especiais
- Níveis de raridade:
  - Comum (50% dos usuários)
  - Raro (25% dos usuários)
  - Épico (10% dos usuários)
  - Lendário (1% dos usuários)

### 11.2 Sistema de XP e Níveis
- Sistema de pontos de experiência (XP)
- Níveis progressivos
- Cálculo dinâmico de progresso
- Recompensas por nível
- Multiplicadores de XP

### 11.3 Interface de Gamificação
- Dialog de conquistas
- Cards de achievement com:
  - Ícone e título
  - Descrição
  - Raridade
  - Status (bloqueado/desbloqueado)
  - Data de desbloqueio
  - Pontos de XP
- Indicadores de progresso
- Feedback visual de desbloqueio
- Animações e efeitos visuais

### 11.4 Integração com Funcionalidades
- Conquistas por notas
- Conquistas por presença
- Conquistas por tarefas
- Conquistas por streaks
- Conquistas especiais por metas

### Status do Projeto

#### Concluído ✅
- Sistema de autenticação com Supabase
- CRUD de disciplinas
- Sistema de notas e frequência
- Calendário acadêmico
- Integração com Google Tasks
- Sistema de conquistas e XP
- Interface responsiva
- Tema personalizado

#### Em Desenvolvimento 🚧
- Notificações push
- Modo offline
- Exportação de dados
- Compartilhamento de tarefas
- Sistema de lembretes

#### Planejado 📋
- Implementação de testes
- PWA (Progressive Web App)
- Temas personalizados
- Sistema de backup
- Integração com outros serviços

### Últimas Atualizações

1. **14/03/2024**
   - Implementação do sistema de gamificação
   - Adição de conquistas e sistema de XP
   - Criação do componente de exibição de conquistas
   - Integração com banco de dados para tracking de progresso

2. **13/03/2024**
   - Implementação do calendário acadêmico
   - Integração com Google Tasks
   - Sistema de autenticação
   - CRUD de disciplinas 