import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSubscription,
  cancelSubscription,
} from "@/lib/stripe";
import { addMonths, addYears } from "date-fns";

// Create subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized or no company associated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, billingCycle = "MONTHLY", paymentMethodId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID é obrigatório" },
        { status: 400 }
      );
    }

    // Get company with Stripe customer ID
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: { subscription: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    if (!company.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer associated. Create customer first." },
        { status: 400 }
      );
    }

    // Check for existing active subscription
    if (company.subscription?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Company already has an active subscription" },
        { status: 400 }
      );
    }

    // Buscar plano do banco de dados
    const plan = await prisma.plan.findUnique({
      where: { planId: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    if (!plan.isActive) {
      return NextResponse.json(
        { error: "Plano não está ativo" },
        { status: 400 }
      );
    }

    // Buscar price ID do Stripe baseado no ciclo de cobrança
    const priceId = billingCycle === "YEARLY" 
      ? plan.stripePriceIdYearly 
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      return NextResponse.json(
        { 
          error: `Price ID do Stripe não configurado para o plano ${planId} (${billingCycle}). Sincronize os planos com o Stripe primeiro.` 
        },
        { status: 400 }
      );
    }

    // Calcular valor baseado no plano
    const planPrice = billingCycle === "YEARLY" 
      ? (plan.yearlyPrice || plan.yearlyTotal ? (plan.yearlyTotal! / 12) : null)
      : plan.monthlyPrice;

    if (!planPrice || planPrice <= 0) {
      return NextResponse.json(
        { error: "Preço do plano não configurado" },
        { status: 400 }
      );
    }

    // Criar subscription no Stripe
    const subscription = await createSubscription({
      customerId: company.stripeCustomerId,
      priceId,
      paymentMethodId,
      metadata: {
        companyId: company.id,
        planId,
        billingCycle,
      },
    });

    // Calcular próxima data de vencimento
    const nextDueDate = billingCycle === "YEARLY"
      ? addYears(new Date(), 1)
      : addMonths(new Date(), 1);

    // Criar ou atualizar subscription no banco
    await prisma.subscription.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planId,
        billingType: billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY",
        value: planPrice,
        status: subscription.status === "active" ? "ACTIVE" : "PENDING",
        nextDueDate,
        cycle: billingCycle,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planId,
        billingType: billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY",
        value: planPrice,
        status: subscription.status === "active" ? "ACTIVE" : "PENDING",
        nextDueDate,
        cycle: billingCycle,
      },
    });

    // Atualizar plano da empresa e limites
    await prisma.company.update({
      where: { id: company.id },
      data: {
        plan: planId as any,
        isTrialing: false,
        maxUsers: plan.maxUsers || company.maxUsers,
        maxExecutions: plan.maxExecutions || company.maxExecutions,
        credits: plan.maxCredits || company.credits,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: (subscription as any).current_period_end,
      },
    });
  } catch (error) {
    console.error("Erro ao criar subscription:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: { subscription: true },
    });

    if (!company?.subscription?.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancelar no Stripe
    await cancelSubscription(company.subscription.stripeSubscriptionId, false);

    // Atualizar no banco
    await prisma.subscription.update({
      where: { id: company.subscription.id },
      data: {
        status: "CANCELED",
        endDate: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao cancelar subscription:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

