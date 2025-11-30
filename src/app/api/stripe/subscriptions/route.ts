import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSubscription,
  cancelSubscription,
  createPrice,
  PLAN_PRICES,
  type PlanId,
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

    if (!planId || !["PROFESSIONAL", "ENTERPRISE"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan" },
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

    // Get plan price
    const planPrice = PLAN_PRICES[planId as PlanId];
    if (!planPrice || !planPrice.monthly) {
      return NextResponse.json(
        { error: "Plan price not configured" },
        { status: 400 }
      );
    }

    const amount = billingCycle === "YEARLY" ? planPrice.yearly! : planPrice.monthly!;
    const interval = billingCycle === "YEARLY" ? "year" : "month";

    // Criar ou buscar Price no Stripe
    // Em produção, você deve criar os prices manualmente no Stripe Dashboard
    // e armazenar os IDs no banco/env
    const priceId = process.env[`STRIPE_PRICE_${planId}_${billingCycle}`] || "";

    if (!priceId) {
      // Criar price dinamicamente (não recomendado para produção)
      const price = await createPrice({
        amount,
        currency: "brl",
        recurring: {
          interval: interval as "month" | "year",
        },
        metadata: {
          planId,
          billingCycle,
        },
      });

      // Criar subscription
      const subscription = await createSubscription({
        customerId: company.stripeCustomerId,
        priceId: price.id,
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
          stripePriceId: price.id,
          planId,
          billingType: billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY",
          value: amount / 100, // Converter de centavos para reais
          status: subscription.status === "active" ? "ACTIVE" : "PENDING",
          nextDueDate,
          cycle: billingCycle,
        },
        update: {
          stripeSubscriptionId: subscription.id,
          stripePriceId: price.id,
          planId,
          billingType: billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY",
          value: amount / 100,
          status: subscription.status === "active" ? "ACTIVE" : "PENDING",
          nextDueDate,
          cycle: billingCycle,
        },
      });

      // Atualizar plano da empresa
      await prisma.company.update({
        where: { id: company.id },
        data: {
          plan: planId,
          isTrialing: false,
        },
      });

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
        },
      });
    }

    // Usar price ID existente
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

    const nextDueDate = billingCycle === "YEARLY"
      ? addYears(new Date(), 1)
      : addMonths(new Date(), 1);

    await prisma.subscription.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planId,
        billingType: billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY",
        value: amount / 100,
        status: subscription.status === "active" ? "ACTIVE" : "PENDING",
        nextDueDate,
        cycle: billingCycle,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planId,
        billingType: billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY",
        value: amount / 100,
        status: subscription.status === "active" ? "ACTIVE" : "PENDING",
        nextDueDate,
        cycle: billingCycle,
      },
    });

    await prisma.company.update({
      where: { id: company.id },
      data: {
        plan: planId,
        isTrialing: false,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
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

