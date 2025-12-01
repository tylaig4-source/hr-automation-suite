import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Forçar renderização dinâmica (usa headers/session)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Se usuário não tiver empresa na sessão, verifica no banco
        let companyId = session.user.companyId;

        if (!companyId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            });

            if (user?.companyId) {
                companyId = user.companyId;
            } else {
                // Se realmente não tiver, cria uma SEM plano ativo
                // Usuário deve escolher plano no onboarding
                const defaultSlug = session.user.email.split("@")[0] + "-" + Date.now().toString(36);

                const newCompany = await prisma.company.create({
                    data: {
                        name: "Minha Empresa",
                        slug: defaultSlug,
                        plan: "TRIAL", // Apenas referência, mas sem acesso
                        credits: 0, // Sem créditos até escolher plano
                        maxUsers: 0, // Sem acesso até escolher plano
                        maxExecutions: 0, // Sem acesso até escolher plano
                        isTrialing: false, // Não está em trial até escolher
                        trialStartDate: null,
                        trialEndDate: null,
                        users: {
                            connect: { id: session.user.id }
                        }
                    }
                });
                companyId = newCompany.id;
            }
        }

        // Verificar se usuário é ADMIN (acesso ilimitado)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        const isAdmin = user?.role === "ADMIN";

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                plan: true,
                credits: true,
                maxExecutions: true,
                maxUsers: true,
                isTrialing: true,
                trialEndDate: true,
                subscription: {
                    select: { status: true },
                },
            },
        });

        if (!company) {
            return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
        }

        // Calcular execuções usadas (baseado em contagem real deste mês)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [usedExecutions, usedUsers] = await Promise.all([
            prisma.execution.count({
                where: {
                    companyId: companyId,
                    createdAt: { gte: startOfMonth }
                }
            }),
            prisma.user.count({
                where: {
                    companyId: companyId
                }
            })
        ]);

        // Admin ou ENTERPRISE tem acesso ilimitado
        const isUnlimited = isAdmin || company.plan === "ENTERPRISE";
        const executionsPercentage = isUnlimited ? 0 : Math.min(100, (usedExecutions / company.maxExecutions) * 100);
        const usersPercentage = isUnlimited ? 0 : Math.min(100, (usedUsers / company.maxUsers) * 100);

        // Calcular dias restantes do trial
        let trialDaysLeft = 0;
        let trialExpired = false;
        if (company.isTrialing && company.trialEndDate) {
            const endDate = new Date(company.trialEndDate);
            const diffTime = endDate.getTime() - now.getTime();
            trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            trialExpired = diffTime <= 0;
        }

        // Verificar se tem plano ativo
        const hasActiveTrial = company.isTrialing && company.trialEndDate && new Date(company.trialEndDate) > new Date();
        const hasActiveSubscription = company.subscription?.status === "ACTIVE";
        const hasActivePlan = hasActiveTrial || hasActiveSubscription;

        return NextResponse.json({
            plan: company.plan,
            credits: isAdmin ? 999999 : company.credits, // Admin tem créditos ilimitados
            maxExecutions: isAdmin ? 999999 : company.maxExecutions, // Admin tem execuções ilimitadas
            usedExecutions,
            executionsPercentage,
            maxUsers: isAdmin ? 999999 : company.maxUsers, // Admin tem usuários ilimitados
            usedUsers,
            usersPercentage,
            percentage: executionsPercentage, // Mantido para compatibilidade
            isUnlimited,
            // Trial info
            isTrialing: company.isTrialing,
            trialEndDate: company.trialEndDate,
            trialDaysLeft,
            trialExpired,
            // Plan status
            hasActivePlan,
            subscription: company.subscription,
        });
    } catch (error) {
        console.error("Erro ao buscar uso:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
