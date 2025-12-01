import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Check, Zap, Shield, Star } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlansClient } from "./plans-client";

export const metadata = {
    title: "Planos e Créditos | SaaS RH",
    description: "Gerencie seu plano e créditos disponíveis.",
};

async function getCompanyData(companyId: string) {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            subscription: true,
            _count: {
                select: {
                    users: true,
                    executions: true,
                },
            },
        },
    });

    return company;
}

async function getPlans() {
    const plans = await prisma.plan.findMany({
        where: { 
            isActive: true,
            isTrial: false, // Não mostrar trial como opção de upgrade
        },
        orderBy: { orderIndex: "asc" },
    });

    return plans;
}

export default async function PlansPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
        redirect("/dashboard");
    }

    const company = await getCompanyData(session.user.companyId);

    if (!company) {
        redirect("/dashboard");
    }

    const plans = await getPlans();

    return <PlansClient company={company} plans={plans} />;
}
