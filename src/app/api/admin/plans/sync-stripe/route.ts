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
    const isConfigured = await isStripeConfigured();
    if (!isConfigured) {
      console.error("[Sync Stripe] Stripe não está configurado");
      return NextResponse.json(
        { error: "Stripe não está configurado. Configure as chaves do Stripe em /admin/settings ou via variáveis de ambiente." },
        { status: 400 }
      );
    }

    // Ler body (pode estar vazio)
    let planId: string | undefined = undefined;
    try {
      const contentType = request.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          const body = await request.json();
          planId = body.planId;
        } catch (e) {
          // Body vazio ou inválido, continuar sem planId específico
          console.log("[Sync Stripe] Body vazio ou inválido, continuando sem planId específico");
        }
      }
    } catch (e) {
      // Ignorar erros ao ler body
      console.log("[Sync Stripe] Erro ao ler body, continuando sem planId específico");
    }

    // Buscar planos
    console.log(`[Sync Stripe] Buscando planos${planId ? ` (planId: ${planId})` : " (todos ativos)"}`);
    const plans = planId
      ? await prisma.plan.findMany({ where: { id: planId } })
      : await prisma.plan.findMany({ where: { isActive: true } });
    
    console.log(`[Sync Stripe] Encontrados ${plans.length} plano(s)`);

    if (plans.length === 0) {
      return NextResponse.json(
        { error: "Nenhum plano encontrado" },
        { status: 404 }
      );
    }

    const results = [];

    for (const plan of plans) {
      try {
        console.log(`[Sync Stripe] Processando plano: ${plan.planId} - ${plan.name}`);
        
        // Pular apenas planos de trial (gratuitos)
        // Planos Enterprise podem ser sincronizados mesmo sem preços (são customizados)
        if (plan.isTrial) {
          console.log(`[Sync Stripe] Plano ${plan.planId} pulado (trial)`);
          results.push({
            planId: plan.planId,
            name: plan.name,
            status: "skipped",
            message: "Plano de trial, pulado",
          });
          continue;
        }
        
        // Avisar se plano não tem preços (mas ainda sincronizar para Enterprise)
        if (plan.monthlyPrice === null && plan.yearlyPrice === null && !plan.isEnterprise) {
          console.log(`[Sync Stripe] Plano ${plan.planId} pulado (sem preço e não é Enterprise)`);
          results.push({
            planId: plan.planId,
            name: plan.name,
            status: "skipped",
            message: "Plano sem preço configurado, pulado",
          });
          continue;
        }
        
        // Avisar se Enterprise não tem preços (mas sincronizar mesmo assim)
        if (plan.isEnterprise && plan.monthlyPrice === null && plan.yearlyPrice === null) {
          console.log(`[Sync Stripe] Aviso: Plano ${plan.planId} é Enterprise e não tem preços configurados. Sincronizando apenas o produto.`);
        }

        // Sincronizar com Stripe
        console.log(`[Sync Stripe] Sincronizando ${plan.planId} com Stripe...`);
        const syncResult = await syncPlanToStripe({
          planId: plan.planId,
          name: plan.name,
          description: plan.description || undefined,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          yearlyTotal: plan.yearlyTotal,
        });

        console.log(`[Sync Stripe] Sincronização bem-sucedida para ${plan.planId}:`, {
          productId: syncResult.productId,
          monthlyPriceId: syncResult.monthlyPriceId,
          yearlyPriceId: syncResult.yearlyPriceId,
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
        console.error(`[Sync Stripe] Erro ao sincronizar plano ${plan.planId}:`, error);
        console.error(`[Sync Stripe] Stack:`, error.stack);
        results.push({
          planId: plan.planId,
          name: plan.name,
          status: "error",
          message: error.message || "Erro ao sincronizar",
          error: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
    console.error("[Sync Stripe] Erro geral:", error);
    console.error("[Sync Stripe] Stack:", error.stack);
    return NextResponse.json(
      { 
        error: error.message || "Erro ao sincronizar planos com Stripe",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

