import { prisma } from "@/lib/prisma";
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

async function getAdminStats() {
  const [
    totalCompanies,
    activeCompanies,
    totalUsers,
    totalExecutions,
    recentCompanies,
    planDistribution,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({
      where: {
        users: {
          some: {},
        },
      },
    }),
    prisma.user.count(),
    prisma.execution.count(),
    prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true, executions: true },
        },
      },
    }),
    prisma.company.groupBy({
      by: ["plan"],
      _count: true,
    }),
  ]);

  return {
    totalCompanies,
    activeCompanies,
    totalUsers,
    totalExecutions,
    recentCompanies,
    planDistribution,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  // Calculate MRR (Monthly Recurring Revenue)
  const planPrices: Record<string, number> = {
    STARTER: 197,
    PROFESSIONAL: 497,
    ENTERPRISE: 997, // Placeholder for enterprise
  };

  const mrr = stats.planDistribution.reduce((acc, plan) => {
    return acc + (planPrices[plan.plan] || 0) * plan._count;
  }, 0);

  const statCards = [
    {
      title: "Total Empresas",
      value: stats.totalCompanies,
      icon: Building2,
      color: "neon-cyan",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Total Usuários",
      value: stats.totalUsers,
      icon: Users,
      color: "neon-magenta",
      change: "+8%",
      trend: "up",
    },
    {
      title: "MRR Estimado",
      value: `R$ ${mrr.toLocaleString("pt-BR")}`,
      icon: DollarSign,
      color: "green-400",
      change: "+15%",
      trend: "up",
    },
    {
      title: "Execuções Total",
      value: stats.totalExecutions,
      icon: Activity,
      color: "neon-purple",
      change: "+24%",
      trend: "up",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Dashboard Admin</h1>
        <p className="text-gray-400 mt-1">
          Visão geral do sistema e métricas principais
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="mt-2 text-3xl font-display font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 bg-${stat.color}/10`}
                  style={{ backgroundColor: `var(--${stat.color}, #00ffff)10` }}
                >
                  <Icon className={`h-6 w-6 text-${stat.color}`} style={{ color: stat.color === 'neon-cyan' ? '#00ffff' : stat.color === 'neon-magenta' ? '#ff00ff' : stat.color === 'green-400' ? '#4ade80' : '#8b5cf6' }} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span className={stat.trend === "up" ? "text-green-400" : "text-red-400"}>
                  {stat.change}
                </span>
                <span className="text-gray-500 text-sm">vs último mês</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Companies */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">Empresas Recentes</h2>
            <Link
              href="/admin/companies"
              className="text-sm text-neon-cyan hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/admin/companies/${company.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-neon-cyan/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-magenta/30 flex items-center justify-center text-white font-bold">
                      {company.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">{company.name}</p>
                      <p className="text-sm text-gray-400">
                        {company._count.users} usuários • {company._count.executions} execuções
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      company.plan === "ENTERPRISE"
                        ? "bg-neon-purple/20 text-neon-purple"
                        : company.plan === "PROFESSIONAL"
                        ? "bg-neon-magenta/20 text-neon-magenta"
                        : "bg-neon-cyan/20 text-neon-cyan"
                    }`}
                  >
                    {company.plan}
                  </span>
                </Link>
              ))}
              {stats.recentCompanies.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma empresa cadastrada ainda
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">Distribuição de Planos</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => {
                const planData = stats.planDistribution.find((p) => p.plan === plan);
                const count = planData?._count || 0;
                const percentage = stats.totalCompanies > 0
                  ? Math.round((count / stats.totalCompanies) * 100)
                  : 0;
                
                const colors = {
                  STARTER: { bg: "bg-neon-cyan", text: "text-neon-cyan" },
                  PROFESSIONAL: { bg: "bg-neon-magenta", text: "text-neon-magenta" },
                  ENTERPRISE: { bg: "bg-neon-purple", text: "text-neon-purple" },
                };

                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{plan}</span>
                      <span className={colors[plan as keyof typeof colors].text}>
                        {count} empresas ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[plan as keyof typeof colors].bg} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue Breakdown */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Receita por Plano</h3>
              <div className="space-y-3">
                {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => {
                  const planData = stats.planDistribution.find((p) => p.plan === plan);
                  const count = planData?._count || 0;
                  const revenue = count * (planPrices[plan] || 0);

                  return (
                    <div key={plan} className="flex items-center justify-between">
                      <span className="text-gray-400">{plan}</span>
                      <span className="text-white font-medium">
                        R$ {revenue.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white font-medium">Total MRR</span>
                  <span className="text-xl font-bold text-green-400">
                    R$ {mrr.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            href="/admin/companies"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-neon-cyan/10 border border-white/10 hover:border-neon-cyan/30 transition-all"
          >
            <Building2 className="h-5 w-5 text-neon-cyan" />
            <span className="text-white">Gerenciar Empresas</span>
          </Link>
          <Link
            href="/admin/subscriptions"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-neon-magenta/10 border border-white/10 hover:border-neon-magenta/30 transition-all"
          >
            <CreditCard className="h-5 w-5 text-neon-magenta" />
            <span className="text-white">Ver Assinaturas</span>
          </Link>
          <Link
            href="/admin/prompts"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-neon-purple/10 border border-white/10 hover:border-neon-purple/30 transition-all"
          >
            <Activity className="h-5 w-5 text-neon-purple" />
            <span className="text-white">Editar Prompts</span>
          </Link>
          <Link
            href="/admin/enterprise-requests"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 transition-all"
          >
            <MessageSquare className="h-5 w-5 text-amber-400" />
            <span className="text-white">Solicitações Enterprise</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

