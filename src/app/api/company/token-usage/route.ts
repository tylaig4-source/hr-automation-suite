import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET - Busca estatísticas de uso de tokens
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const companyId = session.user.companyId;

    // Buscar período (hoje, este mês, mês passado)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Tokens usados hoje
    const todayUsage = await prisma.execution.aggregate({
      where: {
        companyId,
        tokensUsed: { not: null },
        createdAt: { gte: startOfToday },
      },
      _sum: {
        tokensUsed: true,
      },
    });

    // Tokens usados este mês
    const thisMonthUsage = await prisma.execution.aggregate({
      where: {
        companyId,
        tokensUsed: { not: null },
        createdAt: { gte: startOfMonth },
      },
      _sum: {
        tokensUsed: true,
      },
    });

    // Tokens usados mês passado
    const lastMonthUsage = await prisma.execution.aggregate({
      where: {
        companyId,
        tokensUsed: { not: null },
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        tokensUsed: true,
      },
    });

    // Execuções hoje (para calcular média)
    const todayExecutions = await prisma.execution.count({
      where: {
        companyId,
        createdAt: { gte: startOfToday },
      },
    });

    // Execuções este mês
    const thisMonthExecutions = await prisma.execution.count({
      where: {
        companyId,
        createdAt: { gte: startOfMonth },
      },
    });

    // Calcular média de tokens por execução hoje
    const avgTokensPerExecutionToday = todayExecutions > 0 && todayUsage._sum.tokensUsed
      ? Math.round(todayUsage._sum.tokensUsed / todayExecutions)
      : 0;

    // Calcular média de tokens por execução este mês
    const avgTokensPerExecutionMonth = thisMonthExecutions > 0 && thisMonthUsage._sum.tokensUsed
      ? Math.round(thisMonthUsage._sum.tokensUsed / thisMonthExecutions)
      : 0;

    // Estimar gastos mensais baseado na média diária
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const estimatedMonthlyUsage = daysPassed > 0 && todayUsage._sum.tokensUsed
      ? Math.round((todayUsage._sum.tokensUsed / daysPassed) * daysInMonth)
      : (thisMonthUsage._sum.tokensUsed || 0);

    // Buscar modelo mais usado para calcular custo
    const mostUsedModel = await prisma.execution.groupBy({
      by: ["agentId"],
      where: {
        companyId,
        tokensUsed: { not: null },
        createdAt: { gte: startOfMonth },
      },
      _sum: {
        tokensUsed: true,
      },
      orderBy: {
        _sum: {
          tokensUsed: "desc",
        },
        take: 1,
      },
    });

    let estimatedMonthlyCost = 0;
    if (mostUsedModel.length > 0) {
      // Buscar o modelo do agente mais usado
      const agent = await prisma.agent.findUnique({
        where: { id: mostUsedModel[0].agentId },
        select: { model: true },
      });

      if (agent?.model) {
        const { getAverageTokenCost } = await import("@/lib/model-pricing");
        const avgCostPerToken = await getAverageTokenCost(agent.model);
        estimatedMonthlyCost = estimatedMonthlyUsage * avgCostPerToken;
      }
    }

    // Se não encontrou modelo, usar média conservadora
    if (estimatedMonthlyCost === 0) {
      estimatedMonthlyCost = estimatedMonthlyUsage * 0.00001; // Fallback
    }

    // Calcular crescimento comparado ao mês passado
    const growth = lastMonthUsage._sum.tokensUsed
      ? ((thisMonthUsage._sum.tokensUsed || 0) - lastMonthUsage._sum.tokensUsed) / lastMonthUsage._sum.tokensUsed * 100
      : 0;

    // Buscar últimas execuções para gráfico em tempo real
    const recentExecutions = await prisma.execution.findMany({
      where: {
        companyId,
        tokensUsed: { not: null },
        createdAt: { gte: startOfToday },
      },
      select: {
        id: true,
        tokensUsed: true,
        createdAt: true,
        agent: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Agrupar por hora para gráfico
    const hourlyUsage: Record<number, number> = {};
    recentExecutions.forEach((execution) => {
      const hour = new Date(execution.createdAt).getHours();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + (execution.tokensUsed || 0);
    });

    return NextResponse.json({
      today: {
        tokens: todayUsage._sum.tokensUsed || 0,
        executions: todayExecutions,
        avgPerExecution: avgTokensPerExecutionToday,
      },
      thisMonth: {
        tokens: thisMonthUsage._sum.tokensUsed || 0,
        executions: thisMonthExecutions,
        avgPerExecution: avgTokensPerExecutionMonth,
      },
      lastMonth: {
        tokens: lastMonthUsage._sum.tokensUsed || 0,
      },
      estimated: {
        monthlyTokens: estimatedMonthlyUsage,
        monthlyCost: estimatedMonthlyCost,
      },
      growth: Math.round(growth * 10) / 10,
      hourlyUsage: Object.entries(hourlyUsage).map(([hour, tokens]) => ({
        hour: parseInt(hour),
        tokens,
      })).sort((a, b) => a.hour - b.hour),
      recentExecutions: recentExecutions.map((e) => ({
        id: e.id,
        tokens: e.tokensUsed,
        agentName: e.agent.name,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar uso de tokens:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

