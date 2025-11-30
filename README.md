# 🚀 HR Automation Suite

> Sistema SaaS de Automação de RH com Agentes de IA Especializados

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Sobre o Projeto

O **HR Automation Suite** é uma plataforma SaaS que utiliza inteligência artificial para automatizar tarefas operacionais e estratégicas do departamento de Recursos Humanos. O sistema funciona como um "escritório virtual de RH" onde cada tarefa específica é executada por um agente de IA especializado.

### 🎯 Problema que Resolve

Profissionais de RH gastam em média 60-70% do seu tempo em tarefas operacionais repetitivas:

- Redigir descrições de vagas (1-2 horas)
- Analisar currículos (15-30 minutos cada)
- Criar planos de onboarding (3-5 horas)
- Elaborar PDIs (2-4 horas)
- Redigir feedbacks (20-40 minutos cada)

**O HR Automation Suite reduz essas tarefas de horas para minutos.**

### 💡 Proposta de Valor

- ⏱️ **Redução de 85-95%** no tempo de execução
- 📊 **Padronização** de todos os documentos
- 🔄 **Consistência** na comunicação institucional
- 📈 **Escalabilidade** - mesmo time atende empresa em crescimento
- 🌐 **Disponibilidade 24/7**

---

## ✨ Funcionalidades

### ✅ Implementado (MVP)

- 🔐 **Autenticação completa** - Login, registro e recuperação de senha
- 🤖 **8 Agentes de IA** - Especializados em diferentes áreas de RH
- 📝 **Sistema de Templates** - Salvar e reutilizar configurações
- 📊 **Histórico de Execuções** - Com paginação e filtros
- 📈 **Analytics Básico** - Métricas e estatísticas
- 📄 **Exportação PDF/DOCX** - Exportar resultados em documentos
- 💳 **Sistema de Pagamentos** - Integração com Stripe (Cartão de Crédito e PIX)
- 📦 **Planos e Assinaturas** - Sistema de planos com trial gratuito de 3 dias
- 👥 **Painel Administrativo** - Gerenciamento de empresas, usuários e pagamentos
- 🎨 **Interface Moderna** - Design responsivo com dark mode
- 🔄 **Multi-Provider IA** - OpenAI GPT-4 e Google Gemini com fallback automático
- ⚡ **Cache e Rate Limiting** - Via Redis
- 📱 **Totalmente Responsivo** - Funciona em desktop, tablet e mobile

### 🚧 Em Desenvolvimento

- 📧 Sistema de notificações
- 🔔 Alertas e lembretes
- 📊 Analytics avançado
- 🔌 Integrações (ATS, HRIS)

---

## 🏗️ Arquitetura

### Estrutura de Módulos

```
📁 CATEGORIAS (8 módulos)
│
├── 👥 Recrutamento e Seleção (6 agentes)
├── 🚀 Onboarding e Integração (4 agentes)
├── 📚 Treinamento e Desenvolvimento (4 agentes)
├── 📊 Avaliação de Desempenho (4 agentes)
├── ❤️ Clima e Cultura (4 agentes)
├── 📄 Departamento Pessoal (4 agentes)
├── 💰 Remuneração e Benefícios (4 agentes)
└── 🚪 Desligamento (4 agentes)

Total: 34 agentes especializados (8 implementados no MVP)
```

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Estilização** | Tailwind CSS, shadcn/ui |
| **Estado** | React Query, Zustand |
| **Backend** | Next.js API Routes |
| **ORM** | Prisma |
| **Banco** | PostgreSQL 16 (via Docker) |
| **Cache** | Redis 7 (via Docker) |
| **Autenticação** | NextAuth.js |
| **Pagamentos** | Stripe (Cartão de Crédito e PIX) |
| **IA** | OpenAI GPT-4 / Google Gemini (multi-provider) |

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** 20+ (recomendado)
- **Docker** e Docker Compose (ou Podman)
- **Conta na OpenAI** ou **Google AI** (pelo menos uma API Key)

### 🚀 Instalação Automática (Recomendado)

**A forma mais fácil de instalar tudo:**

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/hr-automation-suite.git
cd hr-automation-suite

# 2. Execute o instalador automático
chmod +x install.sh
./install.sh
```

O script irá:
- ✅ Verificar pré-requisitos (Node.js, Docker, etc.)
- ✅ Instalar todas as dependências npm
- ✅ Criar arquivo `.env.local` automaticamente
- ✅ Subir containers Docker (PostgreSQL + Redis)
- ✅ Configurar banco de dados
- ✅ Popular dados iniciais
- ✅ Iniciar o servidor (opcional)

**Após a instalação:**
1. Configure suas API keys no arquivo `.env.local`:
   - `OPENAI_API_KEY="sk-..."` ou `GEMINI_API_KEY="..."`
   - `STRIPE_SECRET_KEY="sk_test_..."` (para pagamentos)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."` (para checkout)

2. Se o servidor não iniciou automaticamente:
   ```bash
   npm run dev
   ```

3. Acesse [http://localhost:3000](http://localhost:3000)

**Credenciais padrão (após seed):**
- Email: `admin@demo.com`
- Senha: `demo123`

---

### 📋 Instalação Manual

Se preferir instalar manualmente ou o script automático não funcionar:

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/hr-automation-suite.git
cd hr-automation-suite

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp ENV_TEMPLATE.md .env.local
# Edite .env.local e adicione suas API keys

# 4. Setup completo automático (Docker + Banco)
make quickstart
# ou manualmente:
# docker-compose up -d
# npm run db:push
# npm run db:seed

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

---

### 📋 Instalação Manual

#### 1. Instalar Dependências

```bash
npm install
```

#### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# ===========================================
# DATABASE (PostgreSQL)
# ===========================================
DATABASE_URL="postgresql://hr_user:hr_secret_2024@localhost:5432/hr_automation?schema=public"

# ===========================================
# REDIS (Cache e Rate Limiting)
# ===========================================
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="redis_secret_2024"

# ===========================================
# AUTENTICAÇÃO (NextAuth.js)
# ===========================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="gere-uma-chave-secreta-segura-aqui"
# Para gerar: openssl rand -base64 32

# ===========================================
# IA (Configure pelo menos um)
# ===========================================
OPENAI_API_KEY="sk-..."           # https://platform.openai.com/api-keys
GEMINI_API_KEY="..."              # https://aistudio.google.com/apikey

# ===========================================
# PAGAMENTOS (Stripe)
# ===========================================
STRIPE_SECRET_KEY="sk_test_..."                    # Chave secreta do Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."  # Chave publicável do Stripe
STRIPE_WEBHOOK_SECRET="whsec_..."                  # Secret do webhook (obtido no Dashboard)

# ===========================================
# OPCIONAIS
# ===========================================
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RATE_LIMIT_REQUESTS_PER_MINUTE=30
MAX_TOKENS_PER_REQUEST=4000
```

#### 3. Subir Containers Docker

```bash
# Opção 1: Docker Compose
docker-compose up -d

# Opção 2: Podman (Linux)
./docker-podman.sh

# Opção 3: Makefile
make docker-up
```

#### 4. Configurar Banco de Dados

```bash
# Gerar Prisma Client
npm run db:generate

# Sincronizar schema com banco
npm run db:push

# Popular dados iniciais (opcional)
npm run db:seed
```

#### 5. Iniciar Servidor

```bash
npm run dev
```

---

## 📁 Estrutura do Projeto

```
hr-automation-suite/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/      # Rotas de autenticação
│   │   ├── (dashboard)/ # Rotas do dashboard
│   │   ├── api/         # API Routes
│   │   └── dashboard/   # Rotas do dashboard (alternativa)
│   ├── components/      # Componentes React
│   │   ├── agents/      # Componentes de agentes
│   │   ├── layout/      # Layout components
│   │   ├── shared/      # Componentes compartilhados
│   │   └── ui/          # Componentes UI (shadcn/ui)
│   ├── lib/             # Utilitários e configs
│   ├── hooks/           # Custom hooks
│   └── types/           # TypeScript types
├── prisma/
│   ├── schema.prisma    # Modelo de dados
│   └── seed.ts          # Dados iniciais
├── prompts/             # Sistema de prompts dos agentes
│   ├── index.ts         # Definição dos agentes
│   └── types.ts         # Tipos dos agentes
├── docs/                 # Documentação
│   ├── DOCKER.md        # Guia Docker
│   ├── DEPLOY_VERCEL.md # Guia de deploy (opcional)
│   └── SNAPSHOT_*.md    # Snapshots do projeto
└── docker-compose.yml   # Configuração Docker
```

Ver [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) para detalhes completos.

---

## 🤖 Agentes Implementados (MVP)

| # | Agente | Categoria | Economia de Tempo |
|---|--------|-----------|-------------------|
| 1 | Criador de Descrições de Vagas | Recrutamento | ~90% |
| 2 | Analisador de Currículos | Recrutamento | ~95% |
| 3 | Criador de Planos de Onboarding | Onboarding | ~95% |
| 4 | Criador de PDIs | Treinamento | ~95% |
| 5 | Criador de Formulários de Avaliação | Avaliação | ~95% |
| 6 | Gerador de Feedbacks Estruturados | Avaliação | ~90% |
| 7 | Gerador de Comunicados Oficiais | DP | ~90% |
| 8 | Roteiro de Entrevista de Desligamento | Desligamento | ~90% |

**Total:** 8 agentes funcionais (26 restantes planejados)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [📋 Especificação Técnica](./docs/DOCUMENTO%20DE%20ESPECIFICAÇÃO%20TÉCNICA%20E%20FUNCIONAL.md) | PRD completo do projeto |
| [🐳 Guia Docker](./docs/DOCKER.md) | Configuração e uso do Docker |
| [📁 Estrutura do Projeto](./PROJECT_STRUCTURE.md) | Detalhes da arquitetura |
| [✅ Checklist de Implementação](./IMPLEMENTATION_CHECKLIST.md) | Status das features |
| [📸 Snapshot Sprint 3](./docs/SNAPSHOT_SPRINT3.md) | Estado atual do projeto |
| [🚀 Deploy Vercel](./docs/DEPLOY_VERCEL.md) | Guia de deploy (opcional) |

---

## 🛠️ Scripts Disponíveis

### 🚀 Instalador Automático (Mais Fácil)

```bash
./install.sh         # Instala tudo automaticamente
```

### Makefile

```bash
make help            # Lista todos os comandos
make quickstart      # Setup completo (Docker + DB)
make dev             # Servidor de desenvolvimento
make docker-up       # Sobe PostgreSQL + Redis
make docker-dev      # Sobe com UIs (pgAdmin + Redis Commander)
make docker-down     # Para containers
make docker-logs     # Ver logs dos containers
make db-studio       # Interface visual do banco (Prisma Studio)
```

### NPM Scripts

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Inicia produção
npm run lint         # Verifica código

# Banco de Dados
npm run db:generate  # Gera Prisma Client
npm run db:push      # Sincroniza schema com banco
npm run db:migrate   # Executa migrations
npm run db:seed      # Popula dados iniciais
npm run db:studio    # Interface visual do banco

# Docker
npm run docker:up    # Sobe containers
npm run docker:down # Para containers
npm run docker:logs # Ver logs

# Testes
npm run test         # Executa testes unitários
npm run test:e2e     # Executa testes E2E (Playwright)
```

---

## 🛣️ Roadmap

### ✅ Fase 1: MVP (Completo)
- [x] 8 agentes core
- [x] Autenticação completa
- [x] Execução e histórico
- [x] Exportação PDF/DOCX
- [x] Sistema de templates
- [x] Analytics básico
- [x] Sistema de pagamentos (Stripe)
- [x] Planos e assinaturas
- [x] Painel administrativo

### 🚧 Fase 2: Crescimento (Em desenvolvimento)
- [ ] 34 agentes completos (26 restantes)
- [ ] Notificações em tempo real
- [ ] Analytics avançado
- [ ] Customização por empresa
- [ ] Integração com calendários

### 📋 Fase 3: Escala (Planejado)
- [ ] Integrações (ATS, HRIS)
- [ ] API pública
- [ ] SSO Enterprise
- [ ] Webhooks

### 🚀 Fase 4: Expansão (Futuro)
- [ ] Mobile app
- [ ] Workflow automation
- [ ] Marketplace de agentes
- [ ] IA customizada por empresa

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estes passos:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add: nova feature'`)
4. **Push** para a branch (`git push origin feature/NovaFeature`)
5. **Abra** um Pull Request

### Padrões de Código

- Use TypeScript para todo o código
- Siga os padrões do ESLint configurado
- Adicione testes para novas features
- Mantenha a documentação atualizada

Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para mais detalhes.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM moderno
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Stripe](https://stripe.com/) - Gateway de pagamentos
- [OpenAI](https://openai.com/) - API de IA
- [Google Gemini](https://ai.google.dev/) - API de IA alternativa

---

## 📧 Contato

Para dúvidas, sugestões ou problemas:

- 📝 Abra uma [Issue](https://github.com/seu-usuario/hr-automation-suite/issues)
- 💬 Discuta no [Discussions](https://github.com/seu-usuario/hr-automation-suite/discussions)

---

<p align="center">
  Feito com ❤️ para revolucionar o RH
</p>
