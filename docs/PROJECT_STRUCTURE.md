# 📁 ESTRUTURA DO PROJETO - HR AUTOMATION SUITE

```
hr-automation-suite/
│
├── 📁 docs/                          # Documentação (já existe)
│   ├── DOCUMENTO DE ESPECIFICAÇÃO...
│   └── MEGA PROMPT SUPREMO...
│
├── 📁 src/
│   ├── 📁 app/                       # Next.js 14 App Router
│   │   ├── 📁 (auth)/               # Grupo de rotas de autenticação
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── 📁 (dashboard)/          # Grupo de rotas protegidas
│   │   │   ├── layout.tsx           # Layout com sidebar
│   │   │   ├── page.tsx             # Dashboard principal
│   │   │   │
│   │   │   ├── 📁 categories/       # Categorias de agentes
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── 📁 agents/           # Execução de agentes
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── 📁 history/          # Histórico de execuções
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── 📁 templates/        # Templates salvos
│   │   │       └── page.tsx
│   │   │
│   │   ├── 📁 api/                  # API Routes
│   │   │   ├── 📁 auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── 📁 categories/
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   ├── 📁 agents/
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── 📁 execute/
│   │   │   │   └── [agentSlug]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── 📁 executions/
│   │   │   │   └── route.ts
│   │   │   │
│   │   │   └── 📁 export/
│   │   │       ├── pdf/
│   │   │       │   └── route.ts
│   │   │       └── docx/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css
│   │
│   ├── 📁 components/               # Componentes React
│   │   ├── 📁 ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 layout/               # Componentes de layout
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── footer.tsx
│   │   │
│   │   ├── 📁 agents/               # Componentes específicos de agentes
│   │   │   ├── agent-card.tsx
│   │   │   ├── agent-form.tsx
│   │   │   ├── agent-output.tsx
│   │   │   └── dynamic-form.tsx
│   │   │
│   │   ├── 📁 dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── recent-executions.tsx
│   │   │   └── quick-access.tsx
│   │   │
│   │   └── 📁 shared/
│   │       ├── loading.tsx
│   │       ├── error-boundary.tsx
│   │       └── copy-button.tsx
│   │
│   ├── 📁 lib/                      # Utilitários e configurações
│   │   ├── prisma.ts                # Cliente Prisma
│   │   ├── auth.ts                  # Configuração NextAuth
│   │   ├── openai.ts                # Cliente OpenAI
│   │   ├── utils.ts                 # Utilitários gerais
│   │   └── validations.ts           # Schemas Zod
│   │
│   ├── 📁 services/                 # Camada de serviços
│   │   ├── agent.service.ts
│   │   ├── execution.service.ts
│   │   ├── prompt.service.ts
│   │   └── export.service.ts
│   │
│   ├── 📁 hooks/                    # Custom hooks
│   │   ├── use-agent.ts
│   │   ├── use-execution.ts
│   │   └── use-categories.ts
│   │
│   ├── 📁 types/                    # TypeScript types
│   │   ├── agent.types.ts
│   │   ├── execution.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   └── 📁 constants/                # Constantes e configs
│       ├── categories.ts
│       └── agents.ts
│
├── 📁 prisma/
│   ├── schema.prisma               # Schema do banco
│   ├── 📁 migrations/              # Migrações
│   └── seed.ts                     # Seed de dados iniciais
│
├── 📁 prompts/                      # Prompts dos agentes (JSON)
│   ├── 📁 recrutamento/
│   │   ├── criador-descricao-vagas.json
│   │   ├── analisador-curriculos.json
│   │   └── ...
│   ├── 📁 onboarding/
│   │   └── ...
│   └── index.ts                    # Exportação de todos os prompts
│
├── 📁 public/
│   ├── favicon.ico
│   └── 📁 images/
│
├── 📁 tests/                       # Testes
│   ├── 📁 unit/
│   ├── 📁 integration/
│   └── 📁 e2e/
│
├── .env.example                    # Template de variáveis de ambiente
├── .env.local                      # Variáveis locais (gitignore)
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 📊 RESUMO DA ARQUITETURA

| Camada | Tecnologia | Responsabilidade |
|--------|------------|------------------|
| **Frontend** | Next.js 14 + React | UI/UX, SSR, App Router |
| **Estilização** | Tailwind CSS + shadcn/ui | Design system |
| **Estado** | React Query + Zustand | Cache e estado global |
| **Formulários** | React Hook Form + Zod | Validação e forms |
| **Backend** | Next.js API Routes | Endpoints REST |
| **ORM** | Prisma | Acesso ao banco |
| **Banco** | PostgreSQL | Persistência |
| **Autenticação** | NextAuth.js | Auth + Sessions |
| **IA** | OpenAI API | Execução de prompts |

