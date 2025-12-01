import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPlanSchema = z.object({
  planId: z.string().min(1, "Plan ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().nullable().optional(),
  monthlyPrice: z.number().nullable().optional(),
  yearlyPrice: z.number().nullable().optional(),
  yearlyTotal: z.number().nullable().optional(),
  maxUsers: z.number().nullable().optional(),
  maxExecutions: z.number().nullable().optional(),
  maxCredits: z.number().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  isPopular: z.boolean().optional().default(false),
  isTrial: z.boolean().optional().default(false),
  isEnterprise: z.boolean().optional().default(false),
  orderIndex: z.number().min(0).optional().default(0),
  stripePriceIdMonthly: z.string().nullable().optional(),
  stripePriceIdYearly: z.string().nullable().optional(),
  features: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Validar dados
    const body = await request.json();
    const validatedData = createPlanSchema.parse(body);

    // Verificar se planId já existe
    const existingPlan = await prisma.plan.findUnique({
      where: { planId: validatedData.planId },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: `Já existe um plano com o ID "${validatedData.planId}"` },
        { status: 400 }
      );
    }

    // Criar plano
    const newPlan = await prisma.plan.create({
      data: {
        planId: validatedData.planId,
        name: validatedData.name,
        description: validatedData.description || null,
        monthlyPrice: validatedData.monthlyPrice,
        yearlyPrice: validatedData.yearlyPrice,
        yearlyTotal: validatedData.yearlyTotal,
        maxUsers: validatedData.maxUsers,
        maxExecutions: validatedData.maxExecutions,
        maxCredits: validatedData.maxCredits,
        isActive: validatedData.isActive ?? true,
        isPopular: validatedData.isPopular ?? false,
        isTrial: validatedData.isTrial ?? false,
        isEnterprise: validatedData.isEnterprise ?? false,
        orderIndex: validatedData.orderIndex ?? 0,
        stripePriceIdMonthly: validatedData.stripePriceIdMonthly,
        stripePriceIdYearly: validatedData.stripePriceIdYearly,
        features: validatedData.features || [],
      },
    });

    return NextResponse.json({
      message: "Plano criado com sucesso",
      plan: newPlan,
    });
  } catch (error: any) {
    console.error("Erro ao criar plano:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erro ao criar plano" },
      { status: 500 }
    );
  }
}

