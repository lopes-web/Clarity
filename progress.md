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
- Layout principal com sidebar ✅
- Sistema de navegação ✅
- Footer com links para políticas ✅
- Sistema de tabs para navegação interna ✅

### 2.2 Páginas Principais
- Dashboard (página inicial) ✅
- Calendário ✅
- Política de Privacidade ✅
- Termos de Serviço ✅

## 3. Editor de Texto Rico

### 3.1 Funcionalidades do Editor
- Editor TipTap com extensões ✅
- Formatação de texto (negrito, itálico, sublinhado) ✅
- Listas (ordenadas, não ordenadas, tarefas) ✅
- Títulos e subtítulos ✅
- Citações e código ✅
- Tabelas ✅
- Links e imagens ✅
- Marca-texto com cores ✅

### 3.2 Recursos Avançados
- Atalhos de teclado ✅
- Menu de contexto ✅
- Menu flutuante ✅
- Menu de comandos ✅
- Exportação para PDF e Word ✅
- Temas claro/escuro ✅
- Modo foco ✅
- Personalização de fonte e tamanho ✅

### 3.3 Sistema de Abas
- Criação de novas abas ✅
- Fechamento de abas ✅
- Renomeação de abas ✅
- Duplicação de abas ✅
- Reordenação de abas ✅
- Menu de contexto para abas ✅

## 4. Sistema de Eventos/Tarefas

### 4.1 Gerenciamento de Estado
- Implementação do EventProvider ✅
- Sistema de armazenamento local ✅
- Sincronização com Google Tasks 🚧
- Mapeamento entre eventos locais e tarefas do Google 🚧

### 4.2 Funcionalidades de Eventos
- Criação de eventos como tarefas ✅
- Edição de eventos/tarefas ✅
- Exclusão de eventos/tarefas ✅
- Marcação de conclusão ✅
- Filtros e ordenação ✅

## 5. Sistema de Autenticação com Supabase

### 5.1 Configuração do Supabase
- Criação do projeto no Supabase ✅
- Configuração das credenciais ✅
- Configuração das tabelas ✅
- Políticas de segurança (RLS) ✅

### 5.2 Esquema do Banco de Dados
- Tabela de perfis de usuários ✅
- Tabela de disciplinas ✅
- Tabela de notas ✅
- Tabela de conquistas ✅
- Políticas de segurança (RLS) ✅
- Triggers para criação automática de perfil ✅

### 5.3 Sistema de Autenticação
- Registro de usuários ✅
- Login com email/senha ✅
- Logout ✅
- Proteção de rotas ✅
- Persistência de sessão ✅

## 6. Funcionalidades do Dashboard

### 6.1 Gerenciamento de Disciplinas
- Adição de disciplinas ✅
- Edição de disciplinas ✅
- Exclusão de disciplinas ✅
- Registro de notas ✅
- Controle de faltas ✅

### 6.2 Visualização de Dados
- Cards de métricas ✅
- Lista de disciplinas ✅
- Próximas tarefas ✅
- Status geral ✅

## 7. Funcionalidades do Calendário

### 7.1 Interface do Calendário
- Visualização mensal ✅
- Lista de tarefas do dia ✅
- Próximas tarefas ✅
- Indicadores visuais de tarefas ✅

### 7.2 Gerenciamento de Tarefas
- Adição de tarefas acadêmicas ✅
- Tipos de tarefas ✅
- Status de conclusão ✅
- Prioridades e lembretes ✅

## 8. Melhorias de UX/UI

### 8.1 Feedback Visual
- Sistema de toast notifications ✅
- Indicadores de carregamento ✅
- Estados de erro ✅
- Confirmações de ações ✅
- Microinterações e animações ✅

### 8.2 Responsividade
- Layout adaptativo ✅
- Sidebar responsiva ✅
- Cards responsivos ✅
- Calendário responsivo ✅
- Grid system otimizado ✅

### 8.3 Melhorias de UI
- Esquema de cores atualizado ✅
- Cards redesenhados ✅
- Tipografia aprimorada ✅
- Consistência visual ✅

## 9. Segurança

### 9.1 Proteção de Dados
- Variáveis de ambiente ✅
- Tokens seguros ✅
- Row Level Security no Supabase ✅
- Validação de formulários ✅

### 9.2 Autenticação
- Proteção de rotas ✅
- Gerenciamento de sessão ✅
- Renovação de tokens ✅
- Logout automático ✅

## 10. Próximos Passos

### 10.1 Melhorias Planejadas
- Implementação de testes 📋
- PWA (Progressive Web App) 📋
- Modo offline aprimorado 🚧
- Notificações push 🚧
- Compartilhamento de tarefas 📋

### 10.2 Backlog
- Sistema de lembretes 🚧
- Temas personalizados 📋
- Integração com outros serviços 📋
- Sistema de backup 📋

### Status do Projeto

#### Concluído ✅
- Sistema de autenticação com Supabase
- CRUD de disciplinas
- Sistema de notas e frequência
- Editor de texto rico
- Sistema de abas
- Exportação para PDF e Word
- Interface responsiva
- Tema personalizado
- Dashboard com métricas
- Calendário de atividades
- Sistema de conquistas

#### Em Desenvolvimento 🚧
- Integração com Google Tasks
- Modo offline
- Sistema de lembretes
- Notificações push

#### Planejado 📋
- Implementação de testes
- PWA (Progressive Web App)
- Temas personalizados
- Sistema de backup
- Compartilhamento de tarefas

### Últimas Atualizações

1. **15/03/2024**
   - Correção na exportação para Word
   - Ajustes no sistema de abas
   - Melhorias na interface do editor
   - Correções de bugs no dashboard

2. **14/03/2024**
   - Implementação do sistema de gamificação
   - Adição de conquistas e sistema de XP
   - Criação do componente de exibição de conquistas
   - Integração com banco de dados para tracking de progresso

3. **13/03/2024**
   - Implementação do calendário acadêmico
   - Integração com Google Tasks
   - Sistema de autenticação
   - CRUD de disciplinas 