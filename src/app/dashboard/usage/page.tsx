import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CostDashboard } from "@/components/dashboard/usage/cost-dashboard";
import { getAverageTokenCost } from "@/lib/model-pricing";

export const metadata: Metadata = {
    title: "Uso e Custos | SaaS RH",
    description: "Visualize o consumo de tokens e custos estimados",
};

export default async function UsagePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            company: true
        }
    });

    if (!user) {
        redirect("/login");
    }

    // Se for admin da empresa ou sistema, vê dados da empresa toda
    const isCompanyAdmin = user.role === "COMPANY_ADMIN" || user.role === "ADMIN";

    const whereClause = isCompanyAdmin
        ? { companyId: user.companyId }
        : { userId: user.id };

    // Buscar execuções
    const executions = await prisma.execution.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            },
            agent: {
                select: {
                    name: true,
                    model: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 1000 // Limite para performance, idealmente paginado
    });

    // Calcular custos e agrupar por usuário
    // Nota: Isso é uma estimativa aproximada feita no backend
    // Idealmente, armazenaríamos o custo exato no banco a cada execução

    const usageByUser = new Map<string, {
        userName: string,
        email: string,
        totalExecutions: number,
        totalTokens: number,
        estimatedCost: number
    }>();

    let totalTokens = 0;
    let totalCost = 0;

    for (const exec of executions) {
        const tokens = exec.tokensUsed || 0;
        // Custo estimado: média de $0.002 / 1k tokens (mix de input/output) se não tivermos exato
        // Usando helper do lib/model-pricing
        const costPerToken = await getAverageTokenCost(exec.agent.model);
        const cost = tokens * costPerToken;

        totalTokens += tokens;
        totalCost += cost;

        const userId = exec.userId;
        const current = usageByUser.get(userId) || {
            userName: exec.user.name || "Sem nome",
            email: exec.user.email,
            totalExecutions: 0,
            totalTokens: 0,
            estimatedCost: 0
        };

        usageByUser.set(userId, {
            ...current,
            totalExecutions: current.totalExecutions + 1,
            totalTokens: current.totalTokens + tokens,
            estimatedCost: current.estimatedCost + cost
        });
    }

    const usageList = Array.from(usageByUser.values()).sort((a, b) => b.estimatedCost - a.estimatedCost);

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">Uso e Custos</h1>
            <p className="text-muted-foreground mb-8">
                Estimativa de consumo de IA {isCompanyAdmin ? "da sua empresa" : "pessoal"}.
            </p>

            <CostDashboard
                totalTokens={totalTokens}
                totalCost={totalCost}
                usageList={usageList}
                executionsCount={executions.length}
            />
        </div>
    );
}
