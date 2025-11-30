"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function upgradePlan(planId: "STARTER" | "PROFESSIONAL" | "ENTERPRISE") {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
        throw new Error("Usuário não associado a uma empresa");
    }

    // Mocked upgrade logic
    // In a real app, this would integrate with Stripe/Payment Gateway

    let creditsToAdd = 0;
    let maxExecutions = 100;
    let maxUsers = 2;

    switch (planId) {
        case "STARTER":
            creditsToAdd = 50;
            maxExecutions = 100;
            maxUsers = 2;
            break;
        case "PROFESSIONAL":
            creditsToAdd = 500;
            maxExecutions = 500;
            maxUsers = 10;
            break;
        case "ENTERPRISE":
            creditsToAdd = 9999;
            maxExecutions = 9999;
            maxUsers = 999;
            break;
    }

    // Update company plan and add credits
    await prisma.company.update({
        where: { id: session.user.companyId },
        data: {
            plan: planId,
            credits: { increment: creditsToAdd },
            maxExecutions,
            maxUsers,
        },
    });

    // Create notification
    await prisma.notification.create({
        data: {
            userId: session.user.id,
            title: "Plano Atualizado! 🎉",
            message: `Sua empresa agora está no plano ${planId}. ${creditsToAdd} créditos foram adicionados.`,
            type: "SUCCESS",
        },
    });

    revalidatePath("/plans");
    revalidatePath("/dashboard");

    return { success: true };
}
