import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Forçar renderização dinâmica (usa headers/session)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const userId = session.user.id;

        // Se usuário não tiver empresa na sessão, verifica no banco
        let companyId = session.user.companyId;

        if (!companyId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { companyId: true }
            });

            if (user?.companyId) {
                companyId = user.companyId;
            } else {
                // Se realmente não tiver, retorna dados vazios em vez de criar empresa
                // Usuário deve passar pelo onboarding primeiro
                return NextResponse.json({
                    plan: "TRIAL",
                    credits: 0,
                    maxExecutions: 0,
                    usedExecutions: 0,
                    executionsPercentage: 0,
                    maxUsers: 0,
                    usedUsers: 0,
                    usersPercentage: 0,
                    percentage: 0,
                    isUnlimited: false,
                    isTrialing: false,
                    trialEndDate: null,
                    trialDaysLeft: 0,
                    trialExpired: false,
                    hasActivePlan: false,
                    subscription: null,
                });
            }
        }

        // Verificar se usuário é ADMIN (acesso ilimitado)
        const user = await prisma.user.findUnique({
            where: { id: userId },
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
        
        // Proteção contra divisão por zero e valores null/undefined
        const maxExecutions = company.maxExecutions || 1;
        const maxUsers = company.maxUsers || 1;
        
        const executionsPercentage = isUnlimited || maxExecutions === 0 
            ? 0 
            : Math.min(100, Math.max(0, (usedExecutions / maxExecutions) * 100));
        const usersPercentage = isUnlimited || maxUsers === 0 
            ? 0 
            : Math.min(100, Math.max(0, (usedUsers / maxUsers) * 100));

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
            plan: company.plan || "TRIAL",
            credits: isAdmin ? 999999 : (company.credits || 0), // Admin tem créditos ilimitados
            maxExecutions: isAdmin ? 999999 : maxExecutions, // Admin tem execuções ilimitadas
            usedExecutions: usedExecutions || 0,
            executionsPercentage: isNaN(executionsPercentage) ? 0 : executionsPercentage,
            maxUsers: isAdmin ? 999999 : maxUsers, // Admin tem usuários ilimitados
            usedUsers: usedUsers || 0,
            usersPercentage: isNaN(usersPercentage) ? 0 : usersPercentage,
            percentage: isNaN(executionsPercentage) ? 0 : executionsPercentage, // Mantido para compatibilidade
            isUnlimited: isUnlimited || false,
            // Trial info
            isTrialing: company.isTrialing || false,
            trialEndDate: company.trialEndDate,
            trialDaysLeft: trialDaysLeft || 0,
            trialExpired: trialExpired || false,
            // Plan status
            hasActivePlan: hasActivePlan || false,
            subscription: company.subscription || null,
        });
    } catch (error: any) {
        console.error("Erro ao buscar uso:", error);
        console.error("Stack trace:", error?.stack);
        console.error("Error details:", {
            message: error?.message,
            name: error?.name,
            code: error?.code,
        });
        return NextResponse.json(
            { 
                error: "Erro interno do servidor",
                message: process.env.NODE_ENV === "development" ? error?.message : undefined,
                code: error?.code,
            },
            { status: 500 }
        );
    }
}
