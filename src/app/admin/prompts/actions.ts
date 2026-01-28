"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAgentPrompt(
    agentId: string,
    data: {
        systemPrompt: string;
        promptTemplate: string;
        inputSchema: any; // Using any to avoid complex type matching in server action, validated by frontend
    }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error("Não autorizado");
    }

    // TODO: Adicionar verificação de role ADMIN aqui

    try {
        await prisma.agent.update({
            where: { id: agentId },
            data: {
                systemPrompt: data.systemPrompt,
                promptTemplate: data.promptTemplate,
                inputSchema: data.inputSchema,
            },
        });

        revalidatePath("/admin/prompts");
        revalidatePath(`/admin/prompts/${agentId}`);

        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar prompt:", error);
        return { success: false, error: "Erro ao atualizar prompt" };
    }
}
