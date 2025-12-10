import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeInstance, isStripeConfigured } from "@/lib/stripe";
import { addMonths, addYears } from "date-fns";

export const dynamic = "force-dynamic";

/**
 * POST - Cria uma Stripe Checkout Session
 * Redireciona o usuário para o checkout transparente da Stripe
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se Stripe está configurado
    const stripeConfigured = await isStripeConfigured();
    if (!stripeConfigured) {
      return NextResponse.json(
        {
          error: "Stripe não está configurado. Configure as chaves do Stripe em /admin/settings",
          code: "STRIPE_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized or no company associated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, billingCycle = "MONTHLY" } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar company com customer Stripe
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        users: {
          take: 1,
          select: {
            email: true,
            name: true,
          },
        },
        subscription: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Verificar se já tem assinatura ativa
    if (company.subscription?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Company already has an active subscription" },
        { status: 400 }
      );
    }

    // Buscar plano do banco
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

    // Buscar price ID do Stripe baseado no ciclo
    const priceId = billingCycle === "YEARLY" 
      ? plan.stripePriceIdYearly 
      : plan.stripePriceIdMonthly;

    if (!priceId) {
      return NextResponse.json(
        {
          error: `Price ID do Stripe não configurado para o plano ${planId} (${billingCycle}). Sincronize os planos com o Stripe primeiro.`,
        },
        { status: 400 }
      );
    }

    // Garantir que o customer existe no Stripe
    if (!company.stripeCustomerId) {
      // Buscar ou criar customer
      const user = company.users[0];
      const stripe = await getStripeInstance();
      
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || company.name,
        metadata: {
          companyId: company.id,
          companyName: company.name,
        },
      });

      await prisma.company.update({
        where: { id: company.id },
        data: { stripeCustomerId: customer.id },
      });

      company.stripeCustomerId = customer.id;
    }

    // Calcular trial period (7 dias para planos mensais)
    const trialPeriodDays = billingCycle === "MONTHLY" ? 7 : undefined;

    // Criar Checkout Session
    const stripe = await getStripeInstance();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: company.stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          companyId: company.id,
          planId,
          billingCycle,
        },
        ...(trialPeriodDays && {
          trial_period_days: trialPeriodDays,
        }),
      },
      payment_method_types: ["card"], // Stripe Checkout suporta cartão por padrão
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        companyId: company.id,
        planId,
        billingCycle,
      },
      // Permitir que o usuário escolha o método de pagamento
      payment_method_collection: "always",
      // Configurações de localização
      locale: "pt-BR",
      // Permitir promo codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error("Erro ao criar Checkout Session:", error);
    return NextResponse.json(
      {
        error: error.message || "Erro interno do servidor",
        details: error.type === "StripeCardError" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}


