"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
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
  ChevronDown,
  Play,
  Target,
  TrendingUp,
  Bot,
  Menu,
  X,
  Cpu,
  Brain,
  Layers,
  LayoutDashboard,
} from "lucide-react";
import { EnterpriseFormModal } from "@/components/enterprise/enterprise-form-modal";

// Counter animation hook
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true);
    }
  }, [startOnView]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

// Intersection observer hook for reveal animations
function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

const modules = [
  {
    name: "Recrutamento e Seleção",
    description: "Todo o ciclo de atração e contratação de talentos",
    agents: 6,
    icon: Users,
    color: "#00ffff",
    examples: ["Descrições de Vagas", "Análise de CVs", "Roteiros de Entrevista"],
  },
  {
    name: "Onboarding e Integração",
    description: "Processos de entrada e adaptação de novos colaboradores",
    agents: 4,
    icon: Rocket,
    color: "#ff00ff",
    examples: ["Planos de Onboarding", "Checklist de Integração", "Trilha de Aprendizagem"],
  },
  {
    name: "Treinamento e Desenvolvimento",
    description: "Capacitação e evolução profissional",
    agents: 4,
    icon: GraduationCap,
    color: "#8b5cf6",
    examples: ["PDI", "Mapeamento de Competências", "Planos de Carreira"],
  },
  {
    name: "Avaliação de Desempenho",
    description: "Mensuração e feedback de performance",
    agents: 4,
    icon: BarChart3,
    color: "#00ff88",
    examples: ["Feedbacks Estruturados", "Avaliações 360°", "Metas SMART"],
  },
  {
    name: "Clima e Cultura",
    description: "Engajamento, pesquisas e ações de cultura",
    agents: 4,
    icon: Heart,
    color: "#ff0099",
    examples: ["Pesquisas de Clima", "Comunicados Internos", "Ações de Engajamento"],
  },
  {
    name: "Departamento Pessoal",
    description: "Comunicações oficiais, políticas e documentos",
    agents: 4,
    icon: FileText,
    color: "#ffaa00",
    examples: ["Políticas de RH", "Comunicados", "Documentos Oficiais"],
  },
  {
    name: "Remuneração e Benefícios",
    description: "Estruturas salariais e pacotes de benefícios",
    agents: 4,
    icon: DollarSign,
    color: "#00ffaa",
    examples: ["Descrições de Cargo", "Pesquisas Salariais", "Pacotes de Benefícios"],
  },
  {
    name: "Desligamento",
    description: "Processos de saída e offboarding",
    agents: 4,
    icon: UserMinus,
    color: "#ff6600",
    examples: ["Entrevistas de Desligamento", "Checklists de Saída", "Cartas de Referência"],
  },
];

const plans = [
  {
    name: "Professional",
    price: "497",
    monthlyPrice: "597",
    description: "Para PMEs e times de RH",
    features: [
      "Até 5 usuários",
      "500 requisições por mês",
      "Todos os 34 agentes de IA",
      "Todas as 8 categorias",
      "Exportação PDF e Word",
      "Histórico de 12 meses",
      "Suporte por chat e e-mail",
      "Templates ilimitados",
    ],
    highlighted: true,
    cta: "Ver opções de pagamento",
    color: "#ff00ff",
    icon: "Zap",
    badge: "Mais Popular",
  },
  {
    name: "Enterprise",
    price: "Customizado",
    monthlyPrice: null,
    description: "Para grandes empresas e multinacionais",
    features: [
      "Usuários ilimitados",
      "Requisições ilimitadas",
      "Agentes customizados para sua empresa",
      "Integrações (ATS, HRIS, ERP)",
      "SSO e autenticação corporativa",
      "API dedicada",
      "Gerente de conta exclusivo",
      "SLA garantido + Treinamento",
    ],
    highlighted: false,
    cta: "Falar com consultor",
    color: "#8b5cf6",
    icon: "Building2",
    badge: null,
  },
];

const problems = [
  { task: "Redigir descrições de vagas", manual: "1-2 horas", ai: "2-5 min", savings: 90 },
  { task: "Criar roteiros de entrevista", manual: "30-60 min", ai: "3-5 min", savings: 90 },
  { task: "Elaborar planos de onboarding", manual: "2-4 horas", ai: "5-10 min", savings: 95 },
  { task: "Redigir comunicados internos", manual: "30-60 min", ai: "2-3 min", savings: 95 },
  { task: "Criar formulários de avaliação", manual: "1-2 horas", ai: "3-5 min", savings: 90 },
  { task: "Elaborar feedbacks estruturados", manual: "20-40 min", ai: "2-3 min", savings: 90 },
];

const testimonials = [
  {
    name: "Maria Silva",
    role: "Gerente de RH",
    company: "TechCorp Brasil",
    text: "Reduzi o tempo de criação de vagas de 2 horas para 5 minutos. Incrível!",
    avatar: "MS",
    rating: 5,
  },
  {
    name: "Carlos Santos",
    role: "Analista de RH",
    company: "Startup XYZ",
    text: "Os planos de onboarding ficam muito mais completos e profissionais.",
    avatar: "CS",
    rating: 5,
  },
  {
    name: "Ana Oliveira",
    role: "Diretora de Pessoas",
    company: "Grupo ABC",
    text: "Finalmente tenho tempo para o que importa: as pessoas.",
    avatar: "AO",
    rating: 5,
  },
];

const faqs = [
  {
    question: "Como funciona o trial grátis de 3 dias?",
    answer: "Ao criar sua conta, você recebe automaticamente 3 dias grátis para testar a plataforma. Durante o trial, você tem acesso a 1 usuário, 10 requisições e 10 créditos. Não é necessário cartão de crédito para começar.",
  },
  {
    question: "O que acontece quando o trial expira?",
    answer: "Após os 3 dias, você precisará escolher um plano para continuar usando a plataforma. Você receberá notificações antes do término do trial e poderá fazer upgrade a qualquer momento.",
  },
  {
    question: "Como funciona a plataforma?",
    answer: "A HR Suite possui 34 agentes de IA especializados em diferentes áreas de RH. Você escolhe o agente, preenche um formulário simples com as informações necessárias, e a IA gera documentos profissionais em segundos. Tudo fica salvo no seu histórico.",
  },
  {
    question: "Quais tipos de documentos posso criar?",
    answer: "Você pode criar descrições de vagas, planos de onboarding, feedbacks estruturados, pesquisas de clima, políticas de RH, comunicados internos, avaliações de desempenho e muito mais. São 8 categorias com 34 agentes especializados.",
  },
  {
    question: "Os dados são seguros?",
    answer: "Sim! Utilizamos criptografia de ponta, não compartilhamos dados com terceiros e você pode excluir seus dados a qualquer momento. Todos os dados são armazenados em servidores seguros no Brasil.",
  },
  {
    question: "Posso personalizar os agentes?",
    answer: "No plano Professional você pode fazer customizações básicas. No plano Enterprise, você pode criar agentes totalmente personalizados para sua cultura e processos específicos.",
  },
  {
    question: "Posso mudar de mensal para anual depois?",
    answer: "Sim! Você pode migrar a qualquer momento. O valor já pago no mês corrente será descontado proporcionalmente do plano anual.",
  },
  {
    question: "O que acontece se meu cartão for recusado?",
    answer: "Tentamos novamente em 24h e 48h. Se todas as tentativas falharem, você receberá um e-mail para atualizar os dados do cartão. O acesso continua por 7 dias para você regularizar.",
  },
  {
    question: "O que acontece se eu usar mais de 500 requisições?",
    answer: "Você pode continuar usando normalmente. Cada requisição excedente custa R$ 0,50, cobrada no próximo ciclo de faturamento.",
  },
  {
    question: "Posso adicionar mais usuários?",
    answer: "Sim! Cada usuário adicional custa R$ 97/mês. Para mais de 10 usuários, recomendamos o plano Enterprise com usuários ilimitados.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "No plano mensal, sim. No plano anual, você pode cancelar a renovação automática a qualquer momento, mas o acesso continua até o fim do período contratado. Não há reembolso proporcional.",
  },
  {
    question: "Preciso de conhecimento técnico para usar?",
    answer: "Não! A interface é intuitiva como preencher um formulário. Se você sabe usar um email, sabe usar o HR Suite. Oferecemos onboarding completo e suporte sempre que precisar.",
  },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [enterpriseFormOpen, setEnterpriseFormOpen] = useState(false);
  
  const isLoggedIn = status === "authenticated" && session?.user;

  // Stats counters
  const agentsCounter = useCountUp(34, 2000);
  const savingsCounter = useCountUp(90, 2000);
  const modulesCounter = useCountUp(8, 1500);
  const availabilityCounter = useCountUp(24, 1500);

  // Reveal animations
  const heroReveal = useRevealOnScroll();
  const problemReveal = useRevealOnScroll();
  const modulesReveal = useRevealOnScroll();
  const howItWorksReveal = useRevealOnScroll();
  const benefitsReveal = useRevealOnScroll();
  const testimonialsReveal = useRevealOnScroll();
  const pricingReveal = useRevealOnScroll();
  const faqReveal = useRevealOnScroll();
  const ctaReveal = useRevealOnScroll();

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Mesh Gradient */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern animate-pattern" />
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-dark">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-magenta to-neon-purple flex items-center justify-center animate-glow-pulse">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta blur-lg opacity-50" />
              </div>
              <span className="font-display font-bold text-2xl bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                HR Suite
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#modulos" className="text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors duration-300">
                Módulos
              </a>
              <a href="#precos" className="text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors duration-300">
                Preços
              </a>
              <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors duration-300">
                FAQ
              </a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-black overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-magenta transition-transform duration-300 group-hover:scale-105" />
                  <span className="relative flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Ir para Dashboard
                  </span>
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="group relative inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-black overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-magenta transition-transform duration-300 group-hover:scale-105" />
                    <span className="relative flex items-center gap-2">
                      Teste Grátis 3 Dias
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neon-cyan" />
              ) : (
                <Menu className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 right-0 glass-dark border-t border-white/5 p-4">
              <nav className="flex flex-col gap-4">
                <a href="#modulos" className="text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors">
                  Módulos
                </a>
                <a href="#precos" className="text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors">
                  Preços
                </a>
                <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors">
                  FAQ
                </a>
                <hr className="border-white/10" />
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta px-6 py-3 text-sm font-semibold text-black"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Ir para Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                      Entrar
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta px-6 py-3 text-sm font-semibold text-black"
                    >
                      Teste Grátis 3 Dias
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section 
          ref={heroReveal.ref}
          className="min-h-screen flex items-center justify-center pt-20"
        >
          <div className="container mx-auto px-4 py-20">
            <div className={`max-w-5xl mx-auto text-center transition-all duration-1000 ${heroReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-sm font-medium mb-8 animate-glow-pulse">
                <Bot className="w-4 h-4" />
                <span>34 agentes de IA especializados em RH</span>
                <Sparkles className="w-4 h-4" />
              </div>
              
              {/* Main Heading */}
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                <span className="block text-white">Transforme</span>
                <span className="block bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple bg-clip-text text-transparent animate-gradient-text bg-[length:200%_auto]">
                  horas de trabalho
                </span>
                <span className="block text-white">em minutos</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Plataforma SaaS que usa inteligência artificial para automatizar{" "}
                <span className="text-neon-cyan font-semibold">90% das tarefas operacionais</span>{" "}
                do seu departamento de RH.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="group relative inline-flex items-center justify-center rounded-2xl px-10 py-5 text-lg font-bold text-black overflow-hidden transition-transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple" />
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      <LayoutDashboard className="w-5 h-5" />
                      Ir para Dashboard
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="group relative inline-flex items-center justify-center rounded-2xl px-10 py-5 text-lg font-bold text-black overflow-hidden transition-transform hover:scale-105"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple" />
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      Teste Grátis 3 Dias
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                )}
                <Link
                  href="#demo"
                  className="group inline-flex items-center justify-center rounded-2xl border-2 border-gray-700 hover:border-neon-cyan bg-white/5 px-10 py-5 text-lg font-semibold transition-all duration-300 hover:bg-neon-cyan/10"
                >
                  <Play className="mr-2 w-5 h-5 text-neon-cyan" />
                  Ver Demonstração
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div ref={agentsCounter.ref} className="glass rounded-2xl p-6 border border-neon-cyan/20 hover:border-neon-cyan/50 transition-all duration-300 group hover:scale-105">
                  <div className="text-4xl md:text-5xl font-display font-bold text-neon-cyan group-hover:neon-text-cyan transition-all">
                    {agentsCounter.count}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Agentes de IA</div>
                </div>
                <div ref={savingsCounter.ref} className="glass rounded-2xl p-6 border border-neon-magenta/20 hover:border-neon-magenta/50 transition-all duration-300 group hover:scale-105">
                  <div className="text-4xl md:text-5xl font-display font-bold text-neon-magenta group-hover:neon-text-magenta transition-all">
                    {savingsCounter.count}%
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Economia de Tempo</div>
                </div>
                <div className="glass rounded-2xl p-6 border border-neon-purple/20 hover:border-neon-purple/50 transition-all duration-300 group hover:scale-105">
                  <div ref={availabilityCounter.ref} className="text-4xl md:text-5xl font-display font-bold text-neon-purple group-hover:neon-text-purple transition-all">
                    {availabilityCounter.count}/7
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Disponibilidade</div>
                </div>
                <div ref={modulesCounter.ref} className="glass rounded-2xl p-6 border border-green-400/20 hover:border-green-400/50 transition-all duration-300 group hover:scale-105">
                  <div className="text-4xl md:text-5xl font-display font-bold text-green-400">
                    {modulesCounter.count}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Módulos de RH</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-gray-500" />
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section 
          ref={problemReveal.ref}
          className="py-32 relative"
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${problemReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                O problema que{" "}
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  resolvemos
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Profissionais de RH gastam{" "}
                <span className="text-neon-cyan font-bold">60-70% do tempo</span>{" "}
                em tarefas operacionais e repetitivas
              </p>
            </div>

            <div className={`max-w-5xl mx-auto transition-all duration-1000 delay-200 ${problemReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="glass rounded-3xl overflow-hidden border border-white/10">
                {/* Header */}
                <div className="grid grid-cols-4 gap-0 p-5 bg-gradient-to-r from-gray-900/80 to-gray-800/80 font-semibold text-sm border-b border-white/10">
                  <div className="text-gray-300">Tarefa</div>
                  <div className="text-center text-red-400">Manual</div>
                  <div className="text-center text-neon-cyan">Com IA</div>
                  <div className="text-center text-green-400">Economia</div>
                </div>
                {/* Rows */}
                {problems.map((problem, i) => (
                  <div 
                    key={i} 
                    className={`grid grid-cols-4 gap-0 p-5 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="font-medium text-white">{problem.task}</div>
                    <div className="text-center text-red-400 font-mono">{problem.manual}</div>
                    <div className="text-center text-neon-cyan font-mono">{problem.ai}</div>
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                        ~{problem.savings}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section 
          id="modulos"
          ref={modulesReveal.ref}
          className="py-32 relative"
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${modulesReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                8 Módulos.{" "}
                <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                  34 Agentes.
                </span>{" "}
                Todas as áreas.
              </h2>
              <p className="text-xl text-gray-400">
                Cada agente é um especialista treinado para uma tarefa específica
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {modules.map((module, i) => {
                const Icon = module.icon;
                return (
                  <div
                    key={module.name}
                    className={`group card-3d glass rounded-2xl p-6 border border-white/10 hover:border-opacity-50 transition-all duration-500 cursor-pointer ${modulesReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ 
                      borderColor: module.color + "30",
                      transitionDelay: `${i * 100}ms`,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: module.color + "20" }}
                    >
                      <Icon className="w-7 h-7" style={{ color: module.color }} />
                    </div>
                    <h3 
                      className="text-lg font-bold mb-2 transition-colors duration-300"
                      style={{ color: "white" }}
                    >
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: module.color + "20",
                          color: module.color 
                        }}
                      >
                        {module.agents} agentes
                      </span>
                      <ChevronRight 
                        className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-all"
                        style={{ color: module.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section 
          ref={howItWorksReveal.ref}
          className="py-32 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${howItWorksReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Simples como{" "}
                <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                  preencher um formulário
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                3 passos para transformar tarefas de horas em minutos
              </p>
            </div>

            <div className={`grid md:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-1000 delay-200 ${howItWorksReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Step 1 */}
              <div className="relative text-center group">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-cyan to-cyan-600 flex items-center justify-center text-3xl font-display font-bold text-black group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-neon-cyan blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-3">Escolha o Agente</h3>
                <p className="text-gray-400">
                  Navegue pelos módulos e selecione a tarefa que precisa automatizar
                </p>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-neon-cyan/50 to-transparent" />
              </div>

              {/* Step 2 */}
              <div className="relative text-center group">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-magenta to-pink-600 flex items-center justify-center text-3xl font-display font-bold text-black group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-neon-magenta blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-3">Preencha os Dados</h3>
                <p className="text-gray-400">
                  Complete o formulário simples com as informações necessárias
                </p>
                {/* Connector Line */}
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-neon-magenta/50 to-transparent" />
              </div>

              {/* Step 3 */}
              <div className="relative text-center group">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-purple to-violet-600 flex items-center justify-center text-3xl font-display font-bold text-white group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-neon-purple blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold mb-3">Receba o Resultado</h3>
                <p className="text-gray-400">
                  A IA gera o documento pronto em segundos. Copie, exporte ou edite!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section 
          ref={benefitsReveal.ref}
          className="py-32"
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-6xl mx-auto transition-all duration-1000 ${benefitsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="font-display text-4xl md:text-5xl font-bold mb-10">
                    Por que escolher o{" "}
                    <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                      HR Suite?
                    </span>
                  </h2>
                  <div className="space-y-8">
                    <div className="flex gap-5 group">
                      <div className="w-14 h-14 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-neon-cyan/20 transition-all duration-300">
                        <Target className="w-6 h-6 text-neon-cyan" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">100% especializado em RH</h3>
                        <p className="text-gray-400">
                          Diferente de ferramentas genéricas, cada prompt foi desenvolvido por especialistas de RH
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-5 group">
                      <div className="w-14 h-14 rounded-xl bg-neon-magenta/10 border border-neon-magenta/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-neon-magenta/20 transition-all duration-300">
                        <Shield className="w-6 h-6 text-neon-magenta" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Outputs profissionais</h3>
                        <p className="text-gray-400">
                          Resultados formatados e prontos para uso, não texto corrido sem estrutura
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-5 group">
                      <div className="w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-green-500/20 transition-all duration-300">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Escala sem esforço</h3>
                        <p className="text-gray-400">
                          Mesmo time de RH atende empresa em crescimento, 24/7
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-5 group">
                      <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Customização por empresa</h3>
                        <p className="text-gray-400">
                          Adapte os prompts à sua cultura, tom de voz e processos internos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="relative">
                  <div className="relative glass rounded-3xl p-10 border border-neon-cyan/20 overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-neon-magenta/10 to-neon-purple/10" />
                    
                    <div className="relative z-10">
                      <div className="text-7xl md:text-8xl font-display font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent mb-3">
                        85-95%
                      </div>
                      <div className="text-xl text-gray-300 mb-8">de redução no tempo de execução</div>
                      <div className="space-y-4">
                        {[
                          "Padronização de qualidade",
                          "Consistência na comunicação",
                          "Redução de erros e esquecimentos",
                          "Disponibilidade total 24/7"
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-neon-cyan" />
                            </div>
                            <span className="text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-magenta/20 rounded-full blur-3xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section 
          ref={testimonialsReveal.ref}
          className="py-32 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-magenta/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${testimonialsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                O que nossos{" "}
                <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                  clientes dizem
                </span>
              </h2>
            </div>

            <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-200 ${testimonialsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Main Testimonial */}
              <div className="relative glass rounded-3xl p-10 border border-white/10">
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-6 h-6 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-2xl md:text-3xl text-white mb-8 leading-relaxed">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-black font-bold text-lg">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{testimonials[activeTestimonial].name}</div>
                    <div className="text-gray-400">
                      {testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}
                    </div>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="flex gap-2 mt-8 justify-center">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i === activeTestimonial 
                          ? 'bg-neon-cyan w-8' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section 
          id="precos"
          ref={pricingReveal.ref}
          className="py-32"
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto text-center mb-8 transition-all duration-1000 ${pricingReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Escolha seu{" "}
                <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                  plano
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Automatize seu RH e economize até 95% do tempo em tarefas operacionais
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className={`flex justify-center mb-8 transition-all duration-1000 delay-100 ${pricingReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-flex items-center gap-2 p-1 rounded-xl glass border border-white/10">
                <button
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    billingCycle === "YEARLY"
                      ? "bg-gradient-to-r from-neon-cyan to-neon-magenta text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Anual
                  {billingCycle === "YEARLY" && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                      -R$ 1.200
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    billingCycle === "MONTHLY"
                      ? "bg-gradient-to-r from-neon-cyan to-neon-magenta text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Mensal
                </button>
              </div>
            </div>

            {/* Savings Badge - Only for Annual */}
            {billingCycle === "YEARLY" && (
              <div className={`flex justify-center mb-8 transition-all duration-1000 delay-100 ${pricingReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 animate-pulse">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold">Economize R$ 1.200/ano no plano anual</span>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={`relative group transition-all duration-500 ${pricingReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                      <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta text-black">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={`relative h-full glass rounded-3xl p-8 border transition-all duration-300 group-hover:scale-[1.02] ${
                      plan.highlighted 
                        ? 'border-neon-magenta/50 bg-neon-magenta/5' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-neon-magenta/10 to-transparent" />
                    )}
                    
                    <div className="relative z-10">
                      {/* Icon and Name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: plan.color + "20" }}
                        >
                          {plan.name === "Professional" ? (
                            <Zap className="w-6 h-6" style={{ color: plan.color }} />
                          ) : (
                            <Shield className="w-6 h-6" style={{ color: plan.color }} />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                          <p className="text-sm text-gray-400">{plan.description}</p>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="mb-8">
                        {plan.price === "Customizado" ? (
                          <div>
                            <div className="text-3xl font-display font-bold text-white">{plan.price}</div>
                            <p className="text-sm text-gray-400 mt-1">Solução sob medida para sua operação</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">A partir de</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm text-gray-400">R$</span>
                              <span className="text-5xl font-display font-bold" style={{ color: plan.color }}>
                                {billingCycle === "YEARLY" ? plan.price : plan.monthlyPrice}
                              </span>
                              <span className="text-gray-400">/mês</span>
                            </div>
                            {billingCycle === "YEARLY" ? (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">no plano anual (12x sem juros)</p>
                                <div className="mt-1 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                  <span className="text-xs font-bold text-green-400">
                                    Economia de R$ 1.200/ano
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 mt-1">cobrança mensal recorrente</p>
                            )}
                            {billingCycle === "MONTHLY" && (
                              <div className="mt-2 line-through text-gray-600 text-sm">
                                <span className="text-gray-500">Anual: R$ {plan.price}/mês</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Features */}
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, fi) => (
                          <li key={fi} className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: plan.color + "20" }}
                            >
                              <Check className="w-3 h-3" style={{ color: plan.color }} />
                            </div>
                            <span className="text-sm text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* CTA */}
                      {plan.name === "Enterprise" ? (
                        <button
                          onClick={() => setEnterpriseFormOpen(true)}
                          className={`flex items-center justify-center gap-2 w-full rounded-xl py-4 font-semibold transition-all duration-300 ${
                            plan.highlighted
                              ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:opacity-90'
                              : 'border-2 border-gray-700 hover:border-gray-500 text-white hover:bg-white/5'
                          }`}
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <Link
                          href="/register"
                          className={`flex items-center justify-center gap-2 w-full rounded-xl py-4 font-semibold transition-all duration-300 ${
                            plan.highlighted
                              ? 'bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:opacity-90'
                              : 'border-2 border-gray-700 hover:border-gray-500 text-white hover:bg-white/5'
                          }`}
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Options Table */}
            <div className={`max-w-4xl mx-auto mt-16 transition-all duration-1000 delay-300 ${pricingReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h3 className="text-xl font-semibold text-white text-center mb-6">Compare as formas de pagamento</h3>
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Forma de pagamento</th>
                      <th className="text-center p-4 text-sm font-medium text-gray-400">Valor/mês</th>
                      <th className="text-center p-4 text-sm font-medium text-gray-400">Total/ano</th>
                      <th className="text-center p-4 text-sm font-medium text-gray-400">Economia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 bg-green-500/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💳</span>
                          <div>
                            <p className="font-medium text-white">Anual no Cartão</p>
                            <p className="text-xs text-gray-500">(12x)</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4 text-white font-semibold">R$ 497</td>
                      <td className="text-center p-4 text-white">R$ 5.964</td>
                      <td className="text-center p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                          R$ 1.200 ✓
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🔄</span>
                          <div>
                            <p className="font-medium text-white">Cartão Recorrente</p>
                            <p className="text-xs text-gray-500">(mensal)</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4 text-white">R$ 597</td>
                      <td className="text-center p-4 text-gray-400">R$ 7.164</td>
                      <td className="text-center p-4 text-gray-500">-</td>
                    </tr>
                    <tr>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📱</span>
                          <div>
                            <p className="font-medium text-white">Mensal no Pix</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center p-4 text-white">R$ 597</td>
                      <td className="text-center p-4 text-gray-400">R$ 7.164</td>
                      <td className="text-center p-4 text-gray-500">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section 
          id="faq"
          ref={faqReveal.ref}
          className="py-32"
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto text-center mb-16 transition-all duration-1000 ${faqReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Perguntas{" "}
                <span className="bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                  Frequentes
                </span>
              </h2>
            </div>

            <div className={`max-w-3xl mx-auto space-y-4 transition-all duration-1000 delay-200 ${faqReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl border border-white/10 overflow-hidden"
                >
                  <button
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-lg pr-4">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-neon-cyan flex-shrink-0 transition-transform duration-300 ${
                        openFaq === i ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === i ? 'max-h-48' : 'max-h-0'
                    }`}
                  >
                    <p className="px-6 pb-6 text-gray-400">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section 
          ref={ctaReveal.ref}
          className="py-32"
        >
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto transition-all duration-1000 ${ctaReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative rounded-3xl overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan via-neon-magenta to-neon-purple opacity-90" />
                <div className="absolute inset-0 bg-grid-pattern opacity-20" />
                
                {/* Content */}
                <div className="relative z-10 p-12 md:p-20 text-center">
                  <h2 className="font-display text-4xl md:text-6xl font-bold text-black mb-6">
                    Pronto para revolucionar seu RH?
                  </h2>
                  <p className="text-xl text-black/70 mb-10 max-w-2xl mx-auto">
                    Junte-se a centenas de empresas que já economizam tempo com nossos agentes de IA especializados.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {isLoggedIn ? (
                      <Link
                        href="/dashboard"
                        className="group inline-flex items-center justify-center rounded-2xl bg-black px-10 py-5 text-lg font-bold text-white hover:bg-gray-900 transition-all hover:scale-105"
                      >
                        <LayoutDashboard className="mr-2 w-5 h-5" />
                        Ir para Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/register"
                        className="group inline-flex items-center justify-center rounded-2xl bg-black px-10 py-5 text-lg font-bold text-white hover:bg-gray-900 transition-all hover:scale-105"
                      >
                        Teste Grátis 3 Dias
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                  {!isLoggedIn && (
                    <p className="text-sm text-black/50 mt-6">
                      Sem cartão de crédito • Trial de 3 dias grátis
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <span className="font-display font-bold text-xl">HR Suite</span>
                </div>
                <p className="text-sm text-gray-400">
                  Automatize seu RH com agentes de IA especializados. Reduza 90% do tempo em tarefas operacionais.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Produto</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#modulos" className="hover:text-neon-cyan transition-colors">Módulos</a></li>
                  <li><a href="#precos" className="hover:text-neon-cyan transition-colors">Preços</a></li>
                  <li><a href="#faq" className="hover:text-neon-cyan transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Empresa</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-neon-cyan transition-colors">Sobre nós</a></li>
                  <li><a href="#" className="hover:text-neon-cyan transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-neon-cyan transition-colors">Contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-neon-cyan transition-colors">Termos de Uso</a></li>
                  <li><a href="#" className="hover:text-neon-cyan transition-colors">Privacidade</a></li>
                  <li><a href="#" className="hover:text-neon-cyan transition-colors">LGPD</a></li>
                </ul>
              </div>
            </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2024 HR Automation Suite. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Feito com ❤️ por{" "}
                <a 
                  href="https://meusuper.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neon-cyan hover:underline"
                >
                  Meu Super App
                </a>
              </span>
            </div>
          </div>
          </div>
        </footer>

        {/* Enterprise Form Modal */}
        <EnterpriseFormModal
          isOpen={enterpriseFormOpen}
          onClose={() => setEnterpriseFormOpen(false)}
          currentPlan={isLoggedIn ? undefined : undefined}
        />
      </div>
    </div>
  );
}
