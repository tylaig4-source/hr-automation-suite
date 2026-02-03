import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!session.user.companyId) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const { planId } = body;

    if (planId !== "TRIAL") {
      return NextResponse.json(
        { error: "Apenas o plano TRIAL pode ser ativado via esta rota" },
        { status: 400 }
      );
    }

    // Buscar plano TRIAL do banco
    const trialPlan = await prisma.plan.findUnique({
      where: { planId: "TRIAL" },
      select: {
        maxCredits: true,
        maxExecutions: true,
        maxUsers: true,
      },
    });

    if (!trialPlan) {
      return NextResponse.json(
        { error: "Plano TRIAL não encontrado no banco de dados" },
        { status: 404 }
      );
    }

    // Calcular datas do trial (padrão: 7 dias)
    const trialDays = 7;
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Atualizar empresa com trial ativo
    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        plan: "TRIAL",
        maxUsers: trialPlan.maxUsers || 1,
        maxExecutions: trialPlan.maxExecutions || 50,
        credits: trialPlan.maxCredits || 50,
        isTrialing: true,
        trialStartDate,
        trialEndDate,
      },
      select: {
        id: true,
        plan: true,
        isTrialing: true,
        trialEndDate: true,
        credits: true,
      },
    });

    // Criar notificação
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Trial Ativado! 🎉",
        message: `Seu trial de 7 dias começou! Você tem até ${trialEndDate.toLocaleDateString("pt-BR")} para explorar todas as funcionalidades.`,
        type: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trial ativado com sucesso!",
      company: {
        plan: company.plan,
        isTrialing: company.isTrialing,
        trialEndDate: company.trialEndDate,
        credits: company.credits,
      },
    });
  } catch (error: any) {
    console.error("Erro ao ativar trial:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao ativar trial" },
      { status: 500 }
    );
  }
}

