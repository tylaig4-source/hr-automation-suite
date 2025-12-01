/**
 * Lógica para sugerir upgrade de plano mensal para anual
 * Após 1 mês no plano mensal, sugerir upgrade destacando desconto
 */

import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

export interface UpgradeSuggestion {
  shouldSuggest: boolean;
  daysSinceSubscription: number;
  monthlyPrice: number;
  yearlyPrice: number | null;
  yearlyTotal: number | null;
  savings: number | null;
  savingsPercentage: number | null;
  planId: string;
  planName: string;
}

/**
 * Verifica se deve sugerir upgrade para plano anual
 * Sugere após 30 dias (1 mês) no plano mensal
 */
export async function shouldSuggestUpgrade(
  companyId: string
): Promise<UpgradeSuggestion | null> {
  try {
    // Buscar subscription da empresa
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: {
        company: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!subscription || subscription.status !== "ACTIVE") {
      return null;
    }

    // Só sugerir se estiver no plano mensal
    if (subscription.cycle !== "MONTHLY" && subscription.billingType !== "MONTHLY") {
      return null;
    }

    // Calcular dias desde a criação da subscription
    const daysSinceSubscription = differenceInDays(
      new Date(),
      subscription.createdAt
    );

    // Sugerir após 30 dias (1 mês)
    const shouldSuggest = daysSinceSubscription >= 30;

    if (!shouldSuggest) {
      return {
        shouldSuggest: false,
        daysSinceSubscription,
        monthlyPrice: subscription.value,
        yearlyPrice: null,
        yearlyTotal: null,
        savings: null,
        savingsPercentage: null,
        planId: subscription.planId,
        planName: subscription.planId,
      };
    }

    // Buscar o plano atual e o plano anual equivalente
    const currentPlan = await prisma.plan.findUnique({
      where: { planId: subscription.planId },
    });

    if (!currentPlan) {
      return null;
    }

    // Buscar plano anual do mesmo tipo (mesmo planId, mas com preço anual)
    const yearlyPlan = await prisma.plan.findUnique({
      where: { planId: subscription.planId },
    });

    // Se não tiver plano anual configurado, usar o mesmo plano mas com preço anual
    const yearlyPrice = yearlyPlan?.yearlyPrice || null;
    const yearlyTotal = yearlyPlan?.yearlyTotal || null;

    // Calcular economia
    let savings: number | null = null;
    let savingsPercentage: number | null = null;

    if (yearlyPrice && subscription.value) {
      // Economia = (preço mensal * 12) - preço total anual
      const monthlyTotal = subscription.value * 12;
      savings = yearlyTotal ? monthlyTotal - yearlyTotal : null;
      savingsPercentage = savings && monthlyTotal > 0
        ? Math.round((savings / monthlyTotal) * 100)
        : null;
    }

    return {
      shouldSuggest: true,
      daysSinceSubscription,
      monthlyPrice: subscription.value,
      yearlyPrice,
      yearlyTotal,
      savings,
      savingsPercentage,
      planId: subscription.planId,
      planName: currentPlan.name,
    };
  } catch (error) {
    console.error("Erro ao verificar sugestão de upgrade:", error);
    return null;
  }
}

