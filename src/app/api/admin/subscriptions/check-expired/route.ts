import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAndUpdateExpiredSubscriptions } from "@/lib/subscription-utils";

export const dynamic = 'force-dynamic';

/**
 * Rota para verificar e atualizar assinaturas expiradas
 * Apenas ADMIN pode executar
 * Pode ser chamada manualmente ou por cron job
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem executar esta ação" },
        { status: 403 }
      );
    }

    const results = await checkAndUpdateExpiredSubscriptions();

    return NextResponse.json({
      success: true,
      message: "Verificação de assinaturas expiradas concluída",
      results,
    });
  } catch (error: any) {
    console.error("Erro ao verificar assinaturas expiradas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao verificar assinaturas expiradas" },
      { status: 500 }
    );
  }
}

/**
 * GET para verificar sem atualizar (apenas relatório)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem executar esta ação" },
        { status: 403 }
      );
    }

    // Buscar assinaturas que podem estar expiradas (sem atualizar)
    const { prisma } = await import("@/lib/prisma");
    const now = new Date();
    const expiredThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const subscriptionsToCheck = await prisma.subscription.findMany({
      where: {
        OR: [
          {
            status: "ACTIVE",
            nextDueDate: {
              lt: now,
            },
          },
          {
            status: "OVERDUE",
            nextDueDate: {
              lt: expiredThreshold,
            },
          },
        ],
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      count: subscriptionsToCheck.length,
      subscriptions: subscriptionsToCheck.map((sub) => ({
        id: sub.id,
        companyId: sub.companyId,
        companyName: sub.company.name,
        status: sub.status,
        nextDueDate: sub.nextDueDate,
        daysOverdue: sub.nextDueDate
          ? Math.floor((now.getTime() - sub.nextDueDate.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      })),
    });
  } catch (error: any) {
    console.error("Erro ao verificar assinaturas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao verificar assinaturas" },
      { status: 500 }
    );
  }
}

