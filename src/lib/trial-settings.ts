import { prisma } from "@/lib/prisma";

/**
 * Busca configurações de trial do banco de dados
 * Agora busca do plano TRIAL e SystemSettings (apenas allowTrialWithoutCard)
 */
export async function getTrialSettings() {
  // Buscar plano TRIAL do banco
  const trialPlan = await prisma.plan.findUnique({
    where: { planId: "TRIAL" },
    select: {
      maxCredits: true,
      maxExecutions: true,
      maxUsers: true,
    },
  });

  // Buscar apenas allowTrialWithoutCard de SystemSettings (configuração global)
  const allowTrialSetting = await prisma.systemSettings.findUnique({
    where: { key: "allow_trial_without_card" },
  });

  const allowTrialWithoutCard = allowTrialSetting 
    ? allowTrialSetting.value === "true" 
    : true; // Default: permitir trial sem cartão

  // Dias de trial padrão: 3 dias
  // Os dias são calculados dinamicamente quando a empresa é criada
  // Os créditos e execuções vêm do plano TRIAL configurado no admin
  const trialDays = 3;

  return {
    trialDays, // Padrão: 3 dias
    trialCredits: trialPlan?.maxCredits || 50, // Do plano TRIAL
    trialExecutions: trialPlan?.maxExecutions || 50, // Do plano TRIAL
    trialUsers: trialPlan?.maxUsers || 1, // Do plano TRIAL
    allowTrialWithoutCard, // Configuração global em SystemSettings
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

