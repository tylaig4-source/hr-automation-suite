"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function upgradePlan(planId: "PROFESSIONAL" | "ENTERPRISE") {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
        throw new Error("Usuário não associado a uma empresa");
    }

    let creditsToAdd = 0;
    let maxExecutions = 500;
    let maxUsers = 5;

    switch (planId) {
        case "PROFESSIONAL":
            creditsToAdd = 500;
            maxExecutions = 500;
            maxUsers = 5;
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

    revalidatePath("/dashboard/plans");
    revalidatePath("/dashboard");

    return { success: true };
}

