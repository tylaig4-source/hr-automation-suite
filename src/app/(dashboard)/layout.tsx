import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Verificar se tem plano ativo - se não tiver, redirecionar para onboarding
  if (!finalCompanyId) {
    redirect("/onboarding");
  }

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

      // Se não tem plano ativo, redirecionar para onboarding
      if (!hasActivePlan) {
        redirect("/onboarding");
      }
    } else {
      // Empresa não encontrada, redirecionar para onboarding
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("Erro ao verificar plano ativo:", error);
    // Em caso de erro, redirecionar para onboarding por segurança
    redirect("/onboarding");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        </div>
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <DashboardShell>
          <Header user={session.user} />
          <main className="p-6 relative z-10">{children}</main>
        </DashboardShell>
      </div>
    </SidebarProvider>
  );
}
