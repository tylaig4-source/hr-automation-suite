import { prisma } from "@/lib/prisma";
import { validateSubscriptionWithStripe } from "./subscription-utils";

/**
 * Middleware de segurança para validar assinatura antes de permitir acesso
 * Valida com Stripe em tempo real para evitar manipulação do banco
 */
export async function validateSubscriptionAccess(companyId: string): Promise<{
  allowed: boolean;
  reason?: string;
  subscriptionId?: string;
}> {
  try {
    // Buscar assinatura da empresa
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        subscription: {
          select: {
            id: true,
            status: true,
            stripeSubscriptionId: true,
          },
        },
        isTrialing: true,
        trialEndDate: true,
      },
    });

    if (!company) {
      return {
        allowed: false,
        reason: "Empresa não encontrada",
      };
    }

    // Se está em trial válido, permitir
    if (company.isTrialing && company.trialEndDate) {
      const now = new Date();
      const endDate = new Date(company.trialEndDate);
      if (endDate > now) {
        return { allowed: true };
      }
    }

    // Se não tem assinatura, bloquear
    if (!company.subscription) {
      return {
        allowed: false,
        reason: "Nenhuma assinatura encontrada",
      };
    }

    // Se status não é ACTIVE, bloquear sem validar Stripe
    if (company.subscription.status !== "ACTIVE") {
      return {
        allowed: false,
        reason: `Assinatura ${company.subscription.status.toLowerCase()}. Renove sua assinatura para continuar.`,
        subscriptionId: company.subscription.id,
      };
    }

    // VALIDAÇÃO CRÍTICA: Verificar com Stripe em tempo real
    // Isso previne manipulação do banco de dados
    if (company.subscription.stripeSubscriptionId) {
      const validation = await validateSubscriptionWithStripe(company.subscription.id);

      if (!validation.isValid) {
        // Status no banco está incorreto ou Stripe diz que não está ativa
        // Atualizar banco e bloquear acesso
        await prisma.subscription.update({
          where: { id: company.subscription.id },
          data: {
            status: validation.actualStatus,
            endDate: validation.actualStatus === "EXPIRED" || validation.actualStatus === "CANCELED"
              ? new Date()
              : null,
          },
        });

        return {
          allowed: false,
          reason: `Assinatura inválida. Status real: ${validation.actualStatus}`,
          subscriptionId: company.subscription.id,
        };
      }

      // Tudo OK, permitir acesso
      return {
        allowed: true,
        subscriptionId: company.subscription.id,
      };
    }

    // Se não tem Stripe ID mas está marcado como ACTIVE, permitir
    // (pode ser assinatura manual ou de teste)
    return {
      allowed: true,
      subscriptionId: company.subscription.id,
    };
  } catch (error: any) {
    console.error("[Subscription Security] Erro ao validar acesso:", error);
    // Em caso de erro, bloquear por segurança
    return {
      allowed: false,
      reason: "Erro ao validar assinatura. Tente novamente.",
    };
  }
}

/**
 * Verifica se deve fazer validação com Stripe
 * Por padrão, valida sempre, mas pode ser configurado para validar apenas periodicamente
 */
export function shouldValidateWithStripe(): boolean {
  // Por padrão, sempre validar para máxima segurança
  // Pode ser configurado via env para validar apenas X% das vezes (cache)
  const validateRate = parseFloat(process.env.SUBSCRIPTION_VALIDATION_RATE || "1.0");
  return Math.random() < validateRate;
}

