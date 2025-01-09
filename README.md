# Clarity - Assistente de Estudos com IA

## 📚 Sobre o Projeto

Clarity é uma aplicação web moderna desenvolvida para auxiliar estudantes em sua jornada acadêmica, combinando organização de estudos com inteligência artificial. O projeto utiliza tecnologias modernas como React, TypeScript, Tailwind CSS e integração com a API Gemini da Google.

## 🌟 Funcionalidades Principais

### 1. Assistente de IA Especializado em Zootecnia
- Integração com Google Gemini 2.0
- Respostas formatadas e estruturadas
- Suporte a análise de imagens
- Processamento de PDFs
- Contexto mantido durante a conversa

### 2. Gerenciamento de Matérias
- Criação de matérias personalizadas
- Cores customizáveis para cada matéria
- Organização automática de conteúdo
- Interface intuitiva

### 3. Sistema de Arquivos
- Estrutura hierárquica de pastas
- Organização automática por matéria
- Suporte a diferentes tipos de arquivos:
  - 📁 Pastas
  - 📝 Notas
  - 📄 Arquivos
- Navegação intuitiva com breadcrumbs
- Persistência de dados local

### 4. Interface Moderna
- Design responsivo
- Temas claros e escuros
- Componentes interativos
- Feedback visual com toasts
- Layout personalizável

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui
  - React Query
  - React Router

- **Inteligência Artificial:**
  - Google Gemini 2.0 API
  - PDF.js para processamento de PDFs

- **Armazenamento:**
  - LocalStorage para persistência de dados

## 📂 Estrutura do Projeto

```
src/
├── components/
│   ├── ui/          # Componentes base (shadcn/ui)
│   ├── layout/      # Componentes de layout
│   └── dashboard/   # Componentes principais
├── lib/
│   ├── gemini.ts    # Serviço de IA
│   └── fileSystem.ts # Sistema de arquivos
├── hooks/           # Hooks personalizados
└── pages/          # Páginas da aplicação
```

## 🚀 Avanços Recentes

1. **Integração com IA**
   - Implementação do chat com Gemini
   - Suporte a análise de imagens
   - Processamento de PDFs
   - Manutenção de contexto nas conversas

2. **Sistema de Arquivos**
   - Implementação completa do gerenciamento de arquivos
   - Integração com gerenciamento de matérias
   - Persistência de dados
   - Estrutura hierárquica

3. **Interface do Usuário**
   - Layout responsivo e moderno
   - Componentes interativos
   - Feedback visual aprimorado
   - Navegação intuitiva

## 🎯 Próximos Passos

1. **Melhorias na IA**
   - Aprimorar processamento de PDFs
   - Adicionar mais contextos específicos
   - Implementar histórico de conversas

2. **Sistema de Arquivos**
   - Adicionar suporte a drag-and-drop
   - Implementar preview de arquivos
   - Adicionar busca de arquivos

3. **Funcionalidades Futuras**
   - Sistema de tarefas
   - Calendário de estudos
   - Estatísticas de progresso
   - Sincronização em nuvem

## 💻 Como Executar

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```env
VITE_GEMINI_API_KEY=sua_chave_api
```

4. Execute o projeto:
```bash
npm run dev
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.
