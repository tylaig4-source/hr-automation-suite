import { prisma } from "@/lib/prisma";
import HomePageClient from "./page-client";

async function getPlans() {
  try {
    const plans = await prisma.plan.findMany({
      where: { 
        isActive: true, 
        isTrial: false, // Não mostrar trial na landing
      },
      orderBy: { orderIndex: "asc" },
    });
    return plans;
  } catch (error) {
    console.error("Erro ao buscar planos para landing:", error);
    return [];
  }
}

export default async function HomePage() {
  const plans = await getPlans();
  
  return <HomePageClient plans={plans} />;
}

