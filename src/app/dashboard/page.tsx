import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  Clock,
  Zap,
  TrendingUp,
  Users,
  Rocket,
  GraduationCap,
  BarChart3,
  Heart,
  FileText,
  DollarSign,
  UserMinus,
  ArrowRight,
  Settings,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

const categories = [
  { name: "Recrutamento e Seleção", slug: "recrutamento-selecao", icon: Users, color: "#6366F1" },
  { name: "Onboarding", slug: "onboarding-integracao", icon: Rocket, color: "#8B5CF6" },
  { name: "Treinamento", slug: "treinamento-desenvolvimento", icon: GraduationCap, color: "#06B6D4" },
  { name: "Avaliação", slug: "avaliacao-desempenho", icon: BarChart3, color: "#10B981" },
  { name: "Clima e Cultura", slug: "clima-cultura", icon: Heart, color: "#F59E0B" },
  { name: "Dept. Pessoal", slug: "departamento-pessoal", icon: FileText, color: "#EF4444" },
  { name: "Remuneração", slug: "remuneracao-beneficios", icon: DollarSign, color: "#14B8A6" },
  { name: "Desligamento", slug: "desligamento", icon: UserMinus, color: "#64748B" },
];

const quickAccess = [
  { name: "Criar Vaga", href: "/dashboard/agents/criador-descricao-vagas", category: "Recrutamento" },
  { name: "Analisar CV", href: "/dashboard/agents/analisador-curriculos", category: "Recrutamento" },
  { name: "Plano Onboarding", href: "/dashboard/agents/criador-plano-onboarding", category: "Onboarding" },
  { name: "Criar PDI", href: "/dashboard/agents/criador-pdi", category: "Treinamento" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name?.split(" ")[0] || "Usuário";
  const userId = session?.user?.id;

  // Buscar role do usuário
  let isAdmin = false;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    isAdmin = user?.role === "ADMIN";
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
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, {userName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            O que vamos automatizar hoje?
          </p>
        </div>

        {/* Admin Button */}
        {isAdmin && (
          <Link href="/admin">
            <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
              <Settings className="h-4 w-4" />
              Painel Admin
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Execuções este mês
            </CardTitle>
            <Zap className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.thisMonthExecutions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalExecutions} execuções no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo economizado
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(stats.totalTimeSaved / 60)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalTimeSaved} minutos economizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Satisfação média
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.averageRating > 0 ? `${stats.averageRating}/5` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado em {stats.recentExecutions.length} avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold mb-4">⚡ Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickAccess.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.category}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📂 Categorias</h2>
          <Link href="/dashboard/categories">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.slug} href={`/dashboard/categories/${category.slug}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">🕐 Histórico Recente</h2>
          <Link href="/dashboard/history">
            <Button variant="ghost" size="sm" className="gap-1">
              Ver tudo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {stats.recentExecutions.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {stats.recentExecutions.map((exec) => (
                  <Link
                    key={exec.id}
                    href={`/dashboard/history?execution=${exec.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">{exec.agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {exec.agent.category.name}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(exec.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>Nenhuma execução ainda.</p>
              <p className="text-sm mt-2">
                Execute um agente para ver o histórico aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
