import { prisma } from "@/lib/prisma";

/**
 * Busca configurações de trial do banco de dados
 */
export async function getTrialSettings() {
  const getSetting = async (key: string, defaultValue: any) => {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });
    if (!setting) return defaultValue;
    
    if (typeof defaultValue === "boolean") {
      return setting.value === "true";
    }
    if (typeof defaultValue === "number") {
      return parseInt(setting.value) || defaultValue;
    }
    return setting.value;
  };

  return {
    trialDays: await getSetting("trial_days", 3),
    trialCredits: await getSetting("trial_credits", 50),
    allowTrialWithoutCard: await getSetting("allow_trial_without_card", true),
  };
}

/**
 * Verifica se uma empresa pode executar agentes
 * Retorna { allowed: boolean, reason?: string }
 */
export async function canExecuteAgents(companyId: string): Promise<{ allowed: boolean; reason?: string }> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      plan: true,
      isTrialing: true,
      trialEndDate: true,
      subscription: {
        select: { status: true },
      },
    },
  });

  if (!company) {
    return { allowed: false, reason: "Empresa não encontrada" };
  }

  // Admin sempre pode executar (verificado separadamente)
  // ENTERPRISE sempre pode executar
  if (company.plan === "ENTERPRISE") {
    return { allowed: true };
  }

  const trialSettings = await getTrialSettings();

  // Se está em trial
  if (company.isTrialing) {
    // Verificar se trial expirou
    if (company.trialEndDate) {
      const now = new Date();
      const endDate = new Date(company.trialEndDate);
      if (endDate < now) {
        return {
          allowed: false,
          reason: "Trial expirado. Assine um plano para continuar usando os agentes.",
        };
      }
    }

    // Se trial sem cartão está desabilitado, bloquear
    if (!trialSettings.allowTrialWithoutCard) {
      return {
        allowed: false,
        reason: "Trial sem cartão está desabilitado. Assine um plano para usar os agentes.",
      };
    }

    return { allowed: true };
  }

  // Se não está em trial, verificar assinatura
  if (company.subscription) {
    if (company.subscription.status === "ACTIVE") {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "Assinatura inativa. Renove sua assinatura para continuar usando os agentes.",
    };
  }

  // Sem trial e sem assinatura
  return {
    allowed: false,
    reason: "Nenhum plano ativo. Assine um plano para usar os agentes.",
  };
}

