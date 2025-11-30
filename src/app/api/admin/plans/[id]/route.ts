import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  monthlyPrice: z.number().nullable().optional(),
  yearlyPrice: z.number().nullable().optional(),
  yearlyTotal: z.number().nullable().optional(),
  maxUsers: z.number().nullable().optional(),
  maxExecutions: z.number().nullable().optional(),
  maxCredits: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isTrial: z.boolean().optional(),
  isEnterprise: z.boolean().optional(),
  orderIndex: z.number().min(0).optional(),
  stripePriceIdMonthly: z.string().nullable().optional(),
  stripePriceIdYearly: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Resolver params
    const resolvedParams = await Promise.resolve(params);
    const planId = resolvedParams.id;

    // Verificar se o plano existe
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    // Validar dados
    const body = await request.json();
    const validatedData = updatePlanSchema.parse(body);

    // Atualizar plano
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: validatedData,
    });

    return NextResponse.json({
      message: "Plano atualizado com sucesso",
      plan: updatedPlan,
    });
  } catch (error: any) {
    console.error("Erro ao atualizar plano:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erro ao atualizar plano" },
      { status: 500 }
    );
  }
}

