import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Clock,
  Zap,
  TrendingUp,
  ArrowRight,
  Bot,
  Sparkles,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/utils";
import { categories, getAgentsByCategory } from "../../../prompts";
import { Button } from "@/components/ui/button";
import { OnboardingWrapper } from "@/components/dashboard/onboarding-wrapper";
import { TrialUpgradeAlert } from "@/components/dashboard/trial-upgrade-alert";
import { PaymentAlert } from "@/components/dashboard/payment-alert";
import { UpgradeSuggestionAlert } from "@/components/dashboard/upgrade-suggestion-alert";
import { getTrialSettings } from "@/lib/trial-settings";

const quickAccess = [
  { name: "Criar Vaga", href: "/dashboard/agents/criador-descricao-vagas", category: "Recrutamento", color: "#00ffff" },
  { name: "Plano Onboarding", href: "/dashboard/agents/criador-plano-onboarding", category: "Onboarding", color: "#ff00ff" },
  { name: "Feedback Estruturado", href: "/dashboard/agents/gerador-feedbacks-estruturados", category: "Avaliação", color: "#10B981" },
  { name: "Pesquisa de Clima", href: "/dashboard/agents/pesquisa-clima", category: "Clima e Cultura", color: "#ff0099" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const userName = session?.user?.name?.split(" ")[0] || "Usuário";
  const userId = session?.user?.id;
  const companyId = session?.user?.companyId;

  // Buscar configurações de trial
  const trialSettings = await getTrialSettings();

  // Buscar informações da empresa
  let companyInfo = {
    plan: "PROFESSIONAL",
    isTrialing: false,
    trialDaysLeft: 0,
    trialExpired: false,
    hasActivePlan: false, // Se tem plano ativo (trial ou assinatura)
    credits: 0,
    subscriptionStatus: undefined as "PENDING" | "ACTIVE" | "OVERDUE" | "CANCELED" | "EXPIRED" | undefined,
    subscriptionNextDueDate: null as Date | null,
  };

  // Se não tem companyId na sessão, buscar do banco pelo userId
  let finalCompanyId = companyId;
  if (!finalCompanyId && userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      if (user?.companyId) {
        finalCompanyId = user.companyId;
      }
    } catch (error) {
      console.error("Erro ao buscar companyId do usuário:", error);
    }
  }

  if (finalCompanyId) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: finalCompanyId },
        select: {
          plan: true,
          isTrialing: true,
          trialEndDate: true,
          credits: true,
          maxUsers: true,
          maxExecutions: true,
          subscription: {
            select: { 
              status: true,
              nextDueDate: true,
            },
          },
        },
      });

      if (company) {
        companyInfo.plan = company.plan;
        companyInfo.isTrialing = company.isTrialing || false;
        companyInfo.credits = company.credits || 0;
        companyInfo.subscriptionStatus = company.subscription?.status;
        companyInfo.subscriptionNextDueDate = company.subscription?.nextDueDate || null;
        
        // Verificar se tem plano ativo (trial ativo OU assinatura ativa)
        const hasActiveTrial = company.isTrialing && company.trialEndDate && new Date(company.trialEndDate) > new Date();
        const hasActiveSubscription = company.subscription?.status === "ACTIVE";
        
        // Também verificar se tem limites configurados (indica que tem plano)
        const hasConfiguredLimits = Boolean(
          (company.maxUsers && company.maxUsers > 0) || 
          (company.maxExecutions && company.maxExecutions > 0) ||
          (company.credits && company.credits > 0)
        );
        
        companyInfo.hasActivePlan = hasActiveTrial || hasActiveSubscription || hasConfiguredLimits;
        
        if (company.isTrialing && company.trialEndDate) {
          const now = new Date();
          const endDate = new Date(company.trialEndDate);
          const diffTime = endDate.getTime() - now.getTime();
          companyInfo.trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          companyInfo.trialExpired = diffTime <= 0;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar informações da empresa:", error);
    }
  }

  // Buscar estatísticas reais do banco
  let stats = {
    totalExecutions: 0,
    thisMonthExecutions: 0,
    totalTimeSaved: 0,
    averageRating: 0,
    recentExecutions: [] as any[],
  };

  if (userId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Total de execuções
      const totalExecutions = await prisma.execution.count({
        where: { userId },
      });

      // Execuções deste mês
      const thisMonthExecutions = await prisma.execution.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
        },
      });

      // Tempo economizado (soma dos estimatedTimeSaved dos agentes executados)
      const executions = await prisma.execution.findMany({
        where: { userId },
        include: {
          agent: {
            select: { estimatedTimeSaved: true },
          },
        },
      });

      const totalTimeSaved = executions.reduce((acc, exec) => {
        return acc + (exec.agent?.estimatedTimeSaved || 0);
      }, 0);

      // Média de ratings
      const ratedExecutions = await prisma.execution.findMany({
        where: {
          userId,
          rating: { not: null },
        },
        select: { rating: true },
      });

      const averageRating =
        ratedExecutions.length > 0
          ? ratedExecutions.reduce((acc, e) => acc + (e.rating || 0), 0) /
          ratedExecutions.length
          : 0;

      // Últimas 3 execuções
      const recentExecutions = await prisma.execution.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          agent: {
            select: {
              name: true,
              slug: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      stats = {
        totalExecutions,
        thisMonthExecutions,
        totalTimeSaved,
        averageRating: Math.round(averageRating * 10) / 10,
        recentExecutions,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Onboarding normal - apenas se tiver plano ativo */}
      {companyInfo.hasActivePlan && (
        <OnboardingWrapper
          companyInfo={{
            isTrialing: companyInfo.isTrialing,
            trialDaysLeft: companyInfo.trialDaysLeft,
          }}
        />
      )}

      {/* Payment Alert - mostrar se tiver assinatura com problemas */}
      {companyInfo.subscriptionStatus && companyInfo.subscriptionStatus !== "ACTIVE" && (
        <PaymentAlert
          subscriptionStatus={companyInfo.subscriptionStatus}
          nextDueDate={companyInfo.subscriptionNextDueDate}
        />
      )}

      {/* Upgrade Suggestion Alert - sugerir upgrade para anual após 1 mês no mensal */}
      {companyInfo.hasActivePlan && !companyInfo.isTrialing && companyInfo.subscriptionStatus === "ACTIVE" && (
        <UpgradeSuggestionAlert />
      )}

      {/* Trial Upgrade Alert - apenas se tiver plano ativo */}
      {companyInfo.hasActivePlan && (companyInfo.isTrialing || companyInfo.trialExpired || !trialSettings.allowTrialWithoutCard) && (
        <TrialUpgradeAlert
          trialDaysLeft={companyInfo.trialDaysLeft}
          trialExpired={companyInfo.trialExpired}
          allowTrialWithoutCard={trialSettings.allowTrialWithoutCard}
        />
      )}

      {/* Welcome Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-xs font-medium">
            <Bot className="w-3 h-3" />
            <span>34 agentes disponíveis</span>
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Olá, {userName}! 👋
        </h1>
        <p className="text-gray-400 mt-1">
          O que vamos automatizar hoje?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 border border-neon-cyan/20 hover:border-neon-cyan/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-400">Execuções este mês</p>
            <div className="p-2 rounded-lg bg-neon-cyan/20">
              <Zap className="h-5 w-5 text-neon-cyan" />
            </div>
          </div>
          <div className="text-4xl font-display font-bold text-white">{stats.thisMonthExecutions}</div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalExecutions} execuções no total
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border border-neon-magenta/20 hover:border-neon-magenta/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-400">Tempo economizado</p>
            <div className="p-2 rounded-lg bg-neon-magenta/20">
              <Clock className="h-5 w-5 text-neon-magenta" />
            </div>
          </div>
          <div className="text-4xl font-display font-bold text-white">
            {Math.round(stats.totalTimeSaved / 60)}h
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalTimeSaved} minutos economizados
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border border-green-400/20 hover:border-green-400/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-gray-400">Satisfação média</p>
            <div className="p-2 rounded-lg bg-green-400/20">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <div className="text-4xl font-display font-bold text-white">
            {stats.averageRating > 0 ? `${stats.averageRating}/5` : "N/A"}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Baseado em {stats.recentExecutions.length} avaliações
          </p>
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-cyan" />
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickAccess.map((item) => (
            <Link key={item.href} href={item.href}>
              <div 
                className="glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                style={{ borderColor: `${item.color}30` }}
              >
                <p className="font-medium text-white group-hover:text-white transition-colors">{item.name}</p>
                <p className="text-xs mt-1" style={{ color: item.color }}>
                  {item.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-magenta" />
            Categorias
          </h2>
          <Link href="/dashboard/categories">
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-neon-cyan transition-colors">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => {
            // @ts-ignore
            const Icon = LucideIcons[category.icon || "Circle"] || LucideIcons.Circle;
            const agentsCount = getAgentsByCategory(category.id).length;
            return (
              <Link key={category.slug} href={`/dashboard/categories/${category.slug}`}>
                <div className="glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon
                        className="h-5 w-5 transition-colors"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-white transition-colors">
                        {category.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {agentsCount} agentes
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-purple" />
            Histórico Recente
          </h2>
          <Link href="/dashboard/history">
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-neon-cyan transition-colors">
              Ver tudo
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
        {stats.recentExecutions.length > 0 ? (
          <div className="glass rounded-xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/10">
              {stats.recentExecutions.map((exec) => (
                <Link
                  key={exec.id}
                  href={`/dashboard/history?execution=${exec.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-white">{exec.agent.name}</p>
                      <p className="text-sm text-gray-500">
                        {exec.agent.category.name}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(exec.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl p-8 text-center border border-white/10">
            <Bot className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Nenhuma execução ainda.</p>
            <p className="text-sm text-gray-500 mt-2">
              Execute um agente para ver o histórico aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
