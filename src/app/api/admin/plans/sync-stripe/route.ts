import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPlanToStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Sincroniza todos os planos do banco de dados com o Stripe
 * Cria produtos e prices automaticamente
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 }
      );
    }

    // Verificar se Stripe está configurado
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe não está configurado. Configure STRIPE_SECRET_KEY no .env" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { planId } = body; // Se fornecido, sincroniza apenas um plano

    // Buscar planos
    const plans = planId
      ? await prisma.plan.findMany({ where: { id: planId } })
      : await prisma.plan.findMany({ where: { isActive: true } });

    if (plans.length === 0) {
      return NextResponse.json(
        { error: "Nenhum plano encontrado" },
        { status: 404 }
      );
    }

    const results = [];

    for (const plan of plans) {
      try {
        // Pular planos de trial (gratuitos)
        if (plan.isTrial || (plan.monthlyPrice === null && plan.yearlyPrice === null)) {
          results.push({
            planId: plan.planId,
            name: plan.name,
            status: "skipped",
            message: "Plano de trial ou sem preço, pulado",
          });
          continue;
        }

        // Sincronizar com Stripe
        const syncResult = await syncPlanToStripe({
          planId: plan.planId,
          name: plan.name,
          description: plan.description || undefined,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          yearlyTotal: plan.yearlyTotal,
        });

        // Atualizar plano no banco com os IDs do Stripe
        await prisma.plan.update({
          where: { id: plan.id },
          data: {
            stripePriceIdMonthly: syncResult.monthlyPriceId,
            stripePriceIdYearly: syncResult.yearlyPriceId,
          },
        });

        results.push({
          planId: plan.planId,
          name: plan.name,
          status: "success",
          productId: syncResult.productId,
          monthlyPriceId: syncResult.monthlyPriceId,
          yearlyPriceId: syncResult.yearlyPriceId,
        });
      } catch (error: any) {
        results.push({
          planId: plan.planId,
          name: plan.name,
          status: "error",
          message: error.message || "Erro ao sincronizar",
        });
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;
    const skippedCount = results.filter((r) => r.status === "skipped").length;

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída: ${successCount} sucesso, ${errorCount} erros, ${skippedCount} pulados`,
      results,
      summary: {
        total: plans.length,
        success: successCount,
        errors: errorCount,
        skipped: skippedCount,
      },
    });
  } catch (error: any) {
    console.error("[Sync Stripe] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao sincronizar planos com Stripe" },
      { status: 500 }
    );
  }
}

