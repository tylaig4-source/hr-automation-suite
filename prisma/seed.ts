import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar planos
  const plans = [
    {
      planId: "TRIAL",
      name: "Trial",
      description: "Teste grátis por 7 dias",
      monthlyPrice: 0,
      yearlyPrice: 0,
      yearlyTotal: 0,
      maxUsers: 1,
      maxExecutions: 500,
      maxCredits: 500,
      features: [
        "1 usuário",
        "500 requisições",
        "500 créditos",
        "Todos os 34 agentes",
        "Todas as 8 categorias",
        "Exportação PDF",
        "Histórico de 30 dias",
        "Suporte por e-mail",
      ],
      isActive: true,
      isPopular: false,
      isTrial: true,
      isEnterprise: false,
      orderIndex: 0,
    },
    {
      planId: "PROFESSIONAL",
      name: "Professional",
      description: "Para PMEs e times de RH",
      monthlyPrice: 597,
      yearlyPrice: 497,
      yearlyTotal: 5964,
      maxUsers: 5,
      maxExecutions: 500,
      maxCredits: 500,
      features: [
        "Até 5 usuários",
        "500 requisições por mês",
        "Todos os 34 agentes de IA",
        "Todas as 8 categorias",
        "Exportação PDF e Word",
        "Histórico de 12 meses",
        "Suporte por chat e e-mail",
        "Templates ilimitados",
      ],
      isActive: true,
      isPopular: true,
      isTrial: false,
      isEnterprise: false,
      orderIndex: 1,
    },
    {
      planId: "ENTERPRISE",
      name: "Enterprise",
      description: "Para grandes empresas e multinacionais",
      monthlyPrice: null,
      yearlyPrice: null,
      yearlyTotal: null,
      maxUsers: null, // Ilimitado
      maxExecutions: null, // Ilimitado
      maxCredits: null, // Ilimitado
      features: [
        "Usuários ilimitados",
        "Requisições ilimitadas",
        "Agentes customizados para sua empresa",
        "Integrações (ATS, HRIS, ERP)",
        "SSO e autenticação corporativa",
        "API dedicada",
        "Gerente de conta exclusivo",
        "SLA garantido + Treinamento",
      ],
      isActive: true,
      isPopular: false,
      isTrial: false,
      isEnterprise: true,
      orderIndex: 2,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findUnique({
      where: { planId: plan.planId },
    });

    if (existing) {
      console.log(`📝 Atualizando plano ${plan.planId}...`);
      await prisma.plan.update({
        where: { planId: plan.planId },
        data: plan,
      });
    } else {
      console.log(`✨ Criando plano ${plan.planId}...`);
      await prisma.plan.create({
        data: plan,
      });
    }
  }

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
