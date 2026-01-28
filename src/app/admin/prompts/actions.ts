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
        return { success: false, error: "Erro ao atualizar prompt" };
    }
}

import { allAgents, categories } from "../../../../prompts";

export async function syncStaticAgents() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error("Não autorizado");
    }

    try {
        // 1. Sincronizar Categorias
        for (const category of categories) {
            await prisma.category.upsert({
                where: { slug: category.slug },
                update: {
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    color: category.color,
                    orderIndex: category.orderIndex,
                },
                create: {
                    id: category.id,
                    slug: category.slug,
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    color: category.color,
                    orderIndex: category.orderIndex,
                },
            });
        }

        // 2. Sincronizar Agentes
        for (const agent of allAgents) {
            // Buscar categoria correta pelo ID (category.id em prompts/index.ts)
            // No DB, categoryId aponta para o ID da tabela Category.
            // Precisamos garantir que a categoria existe. O passo 1 já fez isso usando o ID do arquivo como ID do banco.

            await prisma.agent.upsert({
                where: { slug: agent.slug },
                update: {
                    // Não atualizamos promptTemplate/systemPrompt/inputSchema se já existirem no banco
                    // para não sobrescrever edições do admin.
                    // ATENÇÃO: Se quisermos forçar update, descomentar. 
                    // Mas a ideia é que o arquivo é o 'seed', e o banco é a verdade.
                    // Vamos atualizar apenas metadados "fixos" ou garantir que existe.
                    name: agent.name,
                    description: agent.description,
                    categoryId: agent.categoryId,
                    estimatedTimeSaved: agent.estimatedTimeSaved,
                    model: agent.model,
                    isPremium: agent.isPremium || false,
                },
                create: {
                    id: agent.id,
                    slug: agent.slug,
                    name: agent.name,
                    description: agent.description,
                    shortDescription: agent.shortDescription,
                    categoryId: agent.categoryId,
                    promptTemplate: agent.promptTemplate,
                    systemPrompt: agent.systemPrompt,
                    inputSchema: agent.inputSchema as any,
                    estimatedTimeSaved: agent.estimatedTimeSaved,
                    temperature: agent.temperature,
                    maxTokens: agent.maxTokens,
                    model: agent.model,
                    isPremium: agent.isPremium || false,
                },
            });
        }

        revalidatePath("/admin/prompts");
        return { success: true, count: allAgents.length };
    } catch (error) {
        console.error("Erro ao sincronizar agentes:", error);
        return { success: false, error: "Erro ao sincronizar agentes" };
    }
}
