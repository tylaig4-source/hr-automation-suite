import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlanSelectionPage } from "@/components/onboarding/plan-selection-page";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  const companyId = session.user.companyId;

  // Buscar companyId se não estiver na sessão
  let finalCompanyId = companyId;
  if (!finalCompanyId && userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      if (user?.companyId) {
        finalCompanyId = user.companyId;
      }
    } catch (error) {
      console.error("Erro ao buscar companyId do usuário:", error);
    }
  }

  // Verificar se já tem plano ativo
  if (finalCompanyId) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: finalCompanyId },
        select: {
          isTrialing: true,
          trialEndDate: true,
          maxUsers: true,
          maxExecutions: true,
          credits: true,
          subscription: {
            select: {
              status: true,
            },
          },
        },
      });

      if (company) {
        // Verificar se tem plano ativo
        const hasActiveTrial =
          company.isTrialing &&
          company.trialEndDate &&
          new Date(company.trialEndDate) > new Date();
        const hasActiveSubscription = company.subscription?.status === "ACTIVE";
        const hasConfiguredLimits = Boolean(
          (company.maxUsers && company.maxUsers > 0) ||
            (company.maxExecutions && company.maxExecutions > 0) ||
            (company.credits && company.credits > 0)
        );

        const hasActivePlan =
          hasActiveTrial || hasActiveSubscription || hasConfiguredLimits;

        // Se já tem plano ativo, redirecionar para dashboard
        if (hasActivePlan) {
          redirect("/dashboard");
        }
      }
    } catch (error) {
      console.error("Erro ao verificar plano ativo:", error);
    }
  }

  // Buscar planos disponíveis
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { orderIndex: "asc" },
  });

  return <PlanSelectionPage plans={plans} />;
}

