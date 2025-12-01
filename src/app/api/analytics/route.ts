import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Forçar renderização dinâmica (usa headers/session)
export const dynamic = 'force-dynamic';

// GET - Analytics do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // month, week, year

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Total de execuções
    const totalExecutions = await prisma.execution.count({
      where: { userId },
    });

    // Execuções no período
    const periodExecutions = await prisma.execution.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    // Execuções por agente
    const executionsByAgent = await prisma.execution.groupBy({
      by: ["agentId"],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    const agentDetails = await Promise.all(
      executionsByAgent.map(async (item) => {
        const agent = await prisma.agent.findUnique({
          where: { id: item.agentId },
          select: {
            id: true,
            name: true,
            slug: true,
            estimatedTimeSaved: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        });

        return {
          agent,
          count: item._count,
          timeSaved: (agent?.estimatedTimeSaved || 0) * item._count,
        };
      })
    );

    // Execuções por categoria
    const executionsByCategory = await prisma.execution.groupBy({
      by: ["agentId"],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    const categoryStats: Record<string, number> = {};
    for (const item of executionsByCategory) {
      const agent = await prisma.agent.findUnique({
        where: { id: item.agentId },
        select: {
          category: {
            select: { name: true },
          },
        },
      });

      if (agent?.category) {
        categoryStats[agent.category.name] =
          (categoryStats[agent.category.name] || 0) + item._count;
      }
    }

    // Tempo total economizado
    const allExecutions = await prisma.execution.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      include: {
        agent: {
          select: { estimatedTimeSaved: true },
        },
      },
    });

    const totalTimeSaved = allExecutions.reduce((acc, exec) => {
      return acc + (exec.agent?.estimatedTimeSaved || 0);
    }, 0);

    // Média de ratings
    const ratedExecutions = await prisma.execution.findMany({
      where: {
        userId,
        rating: { not: null },
        createdAt: { gte: startDate },
      },
      select: { rating: true },
    });

    const averageRating =
      ratedExecutions.length > 0
        ? ratedExecutions.reduce((acc, e) => acc + (e.rating || 0), 0) /
          ratedExecutions.length
        : 0;

    // Gráfico de uso ao longo do tempo (últimos 7 dias)
    const dailyStats: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.execution.count({
        where: {
          userId,
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      dailyStats.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    return NextResponse.json({
      period,
      totalExecutions,
      periodExecutions,
      totalTimeSaved,
      averageRating: Math.round(averageRating * 10) / 10,
      topAgents: agentDetails
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      categoryStats,
      dailyStats,
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

