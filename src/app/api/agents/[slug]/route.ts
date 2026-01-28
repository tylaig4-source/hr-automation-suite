import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAgentBySlug } from "../../../../../prompts";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { slug } = params;

        // 1. Tentar buscar no banco
        let dbAgent = await prisma.agent.findUnique({
            where: { slug },
            include: {
                category: true
            }
        });

        // 2. Fallback para estático (se não existir no banco, retornamos o estático para garantir funcionamento)
        // Opcionalmente, pode-se criar no banco aqui também, igual ao execute, mas GET costuma ser idempotente
        if (!dbAgent) {
            const staticAgent = getAgentBySlug(slug);

            if (!staticAgent) {
                return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
            }

            // Retornar estrutura compatível com o frontend
            return NextResponse.json({
                id: staticAgent.id,
                name: staticAgent.name,
                slug: staticAgent.slug,
                description: staticAgent.description,
                categoryId: staticAgent.categoryId,
                estimatedTimeSaved: staticAgent.estimatedTimeSaved,
                inputSchema: staticAgent.inputSchema,
                isPremium: staticAgent.isPremium,
            });
        }

        // 3. Retornar do banco
        return NextResponse.json({
            id: dbAgent.id,
            name: dbAgent.name,
            slug: dbAgent.slug,
            description: dbAgent.description,
            categoryId: dbAgent.categoryId, // ou dbAgent.category.slug se preferir
            estimatedTimeSaved: dbAgent.estimatedTimeSaved,
            inputSchema: dbAgent.inputSchema,
            isPremium: false, // Campo não existe no DB schema atual pelo visto
        });

    } catch (error) {
        console.error("[GetAgent] Erro:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
