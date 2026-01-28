import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PromptList } from "@/components/admin/prompts/prompt-list";

export const metadata: Metadata = {
    title: "Admin - Prompts | SaaS RH",
    description: "Gerenciamento de prompts dos agentes",
};

export default async function AdminPromptsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Buscar role diretamente do banco de dados
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Buscar agentes diretamente do banco
    const agents = await prisma.agent.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            category: true,
        },
    });

    // Mapear para garantir tipos compatíveis (garantir que null vira 0 ou similar)
    const compatibleAgents = agents.map(agent => ({
        ...agent,
        estimatedTimeSaved: agent.estimatedTimeSaved ?? 0 // Fallback para 0 se null
    }));

    // Buscar categorias para o filtro
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Prompts</h1>
                    <p className="text-muted-foreground mt-2">
                        Edite prompts, templates e configurações de formulário dos agentes.
                    </p>
                </div>
            </div>

            <PromptList initialAgents={compatibleAgents} categories={categories} />
        </div>
    );
}
