import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  ArrowRight,
  Zap,
  Clock,
  Shield,
  Sparkles,
  Users,
  Rocket,
  GraduationCap,
  BarChart3,
  Heart,
  FileText,
  DollarSign,
  UserMinus,
  Check,
  Star,
  ChevronRight,
  Play,
  Target,
  TrendingUp,
  Bot,
} from "lucide-react";

const modules = [
  {
    name: "Recrutamento e Seleção",
    description: "Todo o ciclo de atração e contratação de talentos",
    agents: 6,
    icon: Users,
    color: "#6366F1",
    examples: ["Descrições de Vagas", "Análise de CVs", "Roteiros de Entrevista"],
  },
  {
    name: "Onboarding e Integração",
    description: "Processos de entrada e adaptação de novos colaboradores",
    agents: 4,
    icon: Rocket,
    color: "#8B5CF6",
    examples: ["Planos de Onboarding", "Checklist de Integração", "Trilha de Aprendizagem"],
  },
  {
    name: "Treinamento e Desenvolvimento",
    description: "Capacitação e evolução profissional",
    agents: 4,
    icon: GraduationCap,
    color: "#06B6D4",
    examples: ["PDI", "Mapeamento de Competências", "Planos de Carreira"],
  },
  {
    name: "Avaliação de Desempenho",
    description: "Mensuração e feedback de performance",
    agents: 4,
    icon: BarChart3,
    color: "#10B981",
    examples: ["Feedbacks Estruturados", "Avaliações 360°", "Metas SMART"],
  },
  {
    name: "Clima e Cultura",
    description: "Engajamento, pesquisas e ações de cultura",
    agents: 4,
    icon: Heart,
    color: "#F59E0B",
    examples: ["Pesquisas de Clima", "Comunicados Internos", "Ações de Engajamento"],
  },
  {
    name: "Departamento Pessoal",
    description: "Comunicações oficiais, políticas e documentos",
    agents: 4,
    icon: FileText,
    color: "#EF4444",
    examples: ["Políticas de RH", "Comunicados", "Documentos Oficiais"],
  },
  {
    name: "Remuneração e Benefícios",
    description: "Estruturas salariais e pacotes de benefícios",
    agents: 4,
    icon: DollarSign,
    color: "#14B8A6",
    examples: ["Descrições de Cargo", "Pesquisas Salariais", "Pacotes de Benefícios"],
  },
  {
    name: "Desligamento",
    description: "Processos de saída e offboarding",
    agents: 4,
    icon: UserMinus,
    color: "#64748B",
    examples: ["Entrevistas de Desligamento", "Checklists de Saída", "Cartas de Referência"],
  },
];

const plans = [
  {
    name: "Starter",
    price: "197",
    description: "Ideal para pequenas equipes de RH",
    features: [
      "2 usuários",
      "100 execuções/mês",
      "4 categorias básicas",
      "Histórico de 30 dias",
      "Suporte por e-mail",
      "Exportação PDF",
    ],
    highlighted: false,
    cta: "Começar Grátis",
  },
  {
    name: "Professional",
    price: "497",
    description: "Para equipes em crescimento",
    features: [
      "10 usuários",
      "500 execuções/mês",
      "Todas as categorias",
      "Histórico de 1 ano",
      "Suporte Chat + E-mail",
      "Exportação PDF + Word",
      "Customização básica",
      "Templates salvos",
    ],
    highlighted: true,
    cta: "Começar Agora",
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    description: "Para grandes organizações",
    features: [
      "Usuários ilimitados",
      "Execuções ilimitadas",
      "Todas as categorias + custom",
      "Histórico ilimitado",
      "Suporte dedicado",
      "API de integração",
      "SSO corporativo",
      "Agentes personalizados",
    ],
    highlighted: false,
    cta: "Falar com Vendas",
  },
];

const problems = [
  { task: "Redigir descrições de vagas", manual: "1-2 horas", ai: "2-5 min", savings: "~90%" },
  { task: "Criar roteiros de entrevista", manual: "30-60 min", ai: "3-5 min", savings: "~90%" },
  { task: "Elaborar planos de onboarding", manual: "2-4 horas", ai: "5-10 min", savings: "~95%" },
  { task: "Redigir comunicados internos", manual: "30-60 min", ai: "2-3 min", savings: "~95%" },
  { task: "Criar formulários de avaliação", manual: "1-2 horas", ai: "3-5 min", savings: "~90%" },
  { task: "Elaborar feedbacks estruturados", manual: "20-40 min", ai: "2-3 min", savings: "~90%" },
];

const testimonials = [
  {
    name: "Maria Silva",
    role: "Gerente de RH",
    company: "TechCorp Brasil",
    text: "Reduzi o tempo de criação de vagas de 2 horas para 5 minutos. Incrível!",
    avatar: "MS",
  },
  {
    name: "Carlos Santos",
    role: "Analista de RH",
    company: "Startup XYZ",
    text: "Os planos de onboarding ficam muito mais completos e profissionais.",
    avatar: "CS",
  },
  {
    name: "Ana Oliveira",
    role: "Diretora de Pessoas",
    company: "Grupo ABC",
    text: "Finalmente tenho tempo para o que importa: as pessoas.",
    avatar: "AO",
  },
];

const faqs = [
  {
    question: "Como funciona a IA do HR Suite?",
    answer: "Cada agente é treinado com prompts especializados para tarefas específicas de RH. Você preenche um formulário simples e a IA gera documentos profissionais em segundos.",
  },
  {
    question: "Posso personalizar os outputs?",
    answer: "Sim! No plano Professional você pode fazer customizações básicas, e no Enterprise pode criar agentes totalmente personalizados para sua cultura e processos.",
  },
  {
    question: "Os dados são seguros?",
    answer: "Absolutamente. Usamos criptografia de ponta, não compartilhamos dados com terceiros e você pode excluir seus dados a qualquer momento.",
  },
  {
    question: "Preciso de conhecimento técnico?",
    answer: "Não! A interface é intuitiva como preencher um formulário. Se você sabe usar um email, sabe usar o HR Suite.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, sem multas ou burocracia. Você mantém acesso até o fim do período pago.",
  },
];

export default async function HomePage() {
  // Verifica se usuário está autenticado - redireciona para dashboard
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">HR Suite</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#modulos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Módulos
            </a>
            <a href="#precos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Preços
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-pulse">
            <Bot className="w-4 h-4" />
            34 agentes de IA especializados em RH
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Transforme{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              horas de trabalho
            </span>
            <br />
            em minutos
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Plataforma SaaS que usa inteligência artificial para automatizar 
            <strong className="text-foreground"> 90% das tarefas operacionais </strong> 
            do seu departamento de RH.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-8 py-4 text-lg font-semibold hover:border-indigo-300 transition-colors"
            >
              <Play className="mr-2 w-5 h-5" />
              Ver Demonstração
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border">
              <div className="text-4xl font-bold text-indigo-600">34</div>
              <div className="text-sm text-muted-foreground">Agentes de IA</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border">
              <div className="text-4xl font-bold text-purple-600">90%</div>
              <div className="text-sm text-muted-foreground">Economia de Tempo</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border">
              <div className="text-4xl font-bold text-emerald-600">24/7</div>
              <div className="text-sm text-muted-foreground">Disponibilidade</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border">
              <div className="text-4xl font-bold text-amber-600">8</div>
              <div className="text-sm text-muted-foreground">Módulos de RH</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O problema que resolvemos
            </h2>
            <p className="text-xl text-muted-foreground">
              Profissionais de RH gastam <strong className="text-foreground">60-70% do tempo</strong> em tarefas operacionais e repetitivas
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-4 gap-0 p-4 bg-slate-100 dark:bg-slate-700 font-semibold text-sm">
                <div>Tarefa</div>
                <div className="text-center">Manual</div>
                <div className="text-center">Com IA</div>
                <div className="text-center text-emerald-600">Economia</div>
              </div>
              {problems.map((problem, i) => (
                <div key={i} className="grid grid-cols-4 gap-0 p-4 border-t dark:border-slate-700 items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="font-medium">{problem.task}</div>
                  <div className="text-center text-red-500 font-mono">{problem.manual}</div>
                  <div className="text-center text-emerald-500 font-mono">{problem.ai}</div>
                  <div className="text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {problem.savings}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              8 Módulos. 34 Agentes. Todas as áreas de RH.
            </h2>
            <p className="text-xl text-muted-foreground">
              Cada agente é um especialista treinado para uma tarefa específica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.name}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border hover:shadow-xl hover:scale-105 transition-all cursor-pointer group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${module.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: module.color }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                    {module.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded-full">
                      {module.agents} agentes
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simples como preencher um formulário
            </h2>
            <p className="text-xl text-muted-foreground">
              3 passos para transformar tarefas de horas em minutos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Escolha o Agente</h3>
              <p className="text-muted-foreground">
                Navegue pelos módulos e selecione a tarefa que precisa automatizar
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Preencha os Dados</h3>
              <p className="text-muted-foreground">
                Complete o formulário simples com as informações necessárias
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Receba o Resultado</h3>
              <p className="text-muted-foreground">
                A IA gera o documento pronto em segundos. Copie, exporte ou edite!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Por que escolher o HR Suite?
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">100% especializado em RH</h3>
                      <p className="text-muted-foreground">
                        Diferente de ferramentas genéricas, cada prompt foi desenvolvido por especialistas de RH
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Outputs profissionais</h3>
                      <p className="text-muted-foreground">
                        Resultados formatados e prontos para uso, não texto corrido sem estrutura
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Escala sem esforço</h3>
                      <p className="text-muted-foreground">
                        Mesmo time de RH atende empresa em crescimento, 24/7
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Customização por empresa</h3>
                      <p className="text-muted-foreground">
                        Adapte os prompts à sua cultura, tom de voz e processos internos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
                  <div className="text-6xl font-bold mb-2">85-95%</div>
                  <div className="text-xl text-indigo-100 mb-6">de redução no tempo de execução</div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Padronização de qualidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Consistência na comunicação</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Redução de erros e esquecimentos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Disponibilidade total 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role} • {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para todos os tamanhos de equipe
            </h2>
            <p className="text-xl text-muted-foreground">
              Comece grátis e escale conforme sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border-2 ${
                  plan.highlighted
                    ? "border-indigo-500 scale-105 shadow-xl shadow-indigo-500/10"
                    : "border-transparent"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-6">
                  {plan.price === "Sob consulta" ? (
                    <div className="text-3xl font-bold">{plan.price}</div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full text-center rounded-xl py-3 font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border group"
              >
                <summary className="p-6 font-semibold cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Pronto para revolucionar seu RH?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Junte-se a centenas de empresas que já economizam tempo com nossos agentes de IA especializados.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl bg-white text-indigo-600 px-8 py-4 text-lg font-semibold hover:bg-indigo-50 transition-colors"
                  >
                    Começar Grátis Agora
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
                <p className="text-sm text-white/60 mt-4">
                  Sem cartão de crédito • Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">HR Suite</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatize seu RH com agentes de IA especializados. Reduza 90% do tempo em tarefas operacionais.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#modulos" className="hover:text-foreground transition-colors">Módulos</a></li>
                <li><a href="#precos" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 HR Automation Suite. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Feito com ❤️ no Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
