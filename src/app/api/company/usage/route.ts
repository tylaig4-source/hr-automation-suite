import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
                // Se realmente não tiver, cria uma
                const defaultSlug = session.user.email.split("@")[0] + "-" + Date.now().toString(36);

                const newCompany = await prisma.company.create({
                    data: {
                        name: "Minha Empresa",
                        slug: defaultSlug,
                        credits: 50,
                        users: {
                            connect: { id: session.user.id }
                        }
                    }
                });
                companyId = newCompany.id;
            }
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                plan: true,
                credits: true,
                maxExecutions: true,
            },
        });

        if (!company) {
            return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
        }

        // Calcular execuções usadas (baseado em contagem real deste mês)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const usedExecutions = await prisma.execution.count({
            where: {
                companyId: companyId,
                createdAt: { gte: startOfMonth }
            }
        });

        // Se o plano for ENTERPRISE (ilimitado), credits pode ser irrelevante ou alto
        const isUnlimited = company.plan === "ENTERPRISE";
        const percentage = isUnlimited ? 100 : Math.min(100, (usedExecutions / company.maxExecutions) * 100);

        return NextResponse.json({
            plan: company.plan,
            credits: company.credits,
            maxExecutions: company.maxExecutions,
            usedExecutions,
            percentage,
            isUnlimited,
        });
    } catch (error) {
        console.error("Erro ao buscar uso:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
