import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSubscription,
  cancelSubscription,
  createAndAttachPaymentMethod,
  getStripeInstance,
  createPixPayment,
  isStripeConfigured,
} from "@/lib/stripe";
import { addMonths, addYears } from "date-fns";

// Create subscription
export async function POST(request: NextRequest) {
  try {
    // Verificar se Stripe está configurado
    const stripeConfigured = await isStripeConfigured();
    if (!stripeConfigured) {
      return NextResponse.json(
        { 
          error: "Stripe não está configurado. Configure as chaves do Stripe em /admin/settings",
          code: "STRIPE_NOT_CONFIGURED"
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
    const { 
      planId, 
      billingCycle = "MONTHLY", 
      paymentMethodId,
      creditCard,
      creditCardHolderInfo,
      paymentMethodType, // "CREDIT_CARD" | "PIX" | "BOLETO"
    } = body;

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

    // Se tiver dados do cartão, criar e anexar PaymentMethod
    let finalPaymentMethodId = paymentMethodId;
    
    if (creditCard && creditCard.number && creditCard.expiryMonth && creditCard.expiryYear && creditCard.ccv) {
      try {
        const paymentMethod = await createAndAttachPaymentMethod({
          customerId: company.stripeCustomerId,
          card: {
            number: creditCard.number.replace(/\s/g, ""), // Remove espaços
            exp_month: parseInt(creditCard.expiryMonth, 10),
            exp_year: parseInt(creditCard.expiryYear, 10),
            cvc: creditCard.ccv,
          },
          billing_details: creditCardHolderInfo ? {
            name: creditCardHolderInfo.name,
            email: creditCardHolderInfo.email,
            phone: creditCardHolderInfo.phone,
            address: (creditCardHolderInfo.address || creditCardHolderInfo.postalCode) ? {
              line1: creditCardHolderInfo.address 
                ? `${creditCardHolderInfo.address}${creditCardHolderInfo.addressNumber ? `, ${creditCardHolderInfo.addressNumber}` : ""}`
                : undefined,
              postal_code: creditCardHolderInfo.postalCode,
              city: creditCardHolderInfo.city,
              state: creditCardHolderInfo.state,
              country: "BR",
            } : undefined,
          } : undefined,
          setAsDefault: true, // Definir como método de pagamento padrão
        });
        
        finalPaymentMethodId = paymentMethod.id;
      } catch (error: any) {
        console.error("Erro ao criar PaymentMethod:", error);
        return NextResponse.json(
          { 
            error: error.message || "Erro ao processar dados do cartão. Verifique os dados e tente novamente.",
            details: error.type === "StripeCardError" ? error.message : undefined,
          },
          { status: 400 }
        );
      }
    }

    // Se não tiver PaymentMethod, verificar se o customer já tem um método padrão
    if (!finalPaymentMethodId) {
      try {
        const stripe = await getStripeInstance();
        const customer = await stripe.customers.retrieve(company.stripeCustomerId);
        
        if (customer && !customer.deleted && typeof customer === 'object' && 'invoice_settings' in customer) {
          const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;
          if (defaultPaymentMethod && typeof defaultPaymentMethod === 'string') {
            finalPaymentMethodId = defaultPaymentMethod;
          }
        }
      } catch (error) {
        console.error("Erro ao verificar payment method padrão:", error);
      }
    }

    // Para PIX e BOLETO, não é necessário payment method (são pagamentos únicos)
    // Mas ainda precisamos verificar se é um método que requer payment method
    const requiresPaymentMethod = paymentMethodType !== "PIX" && paymentMethodType !== "BOLETO";
    
    if (requiresPaymentMethod && !finalPaymentMethodId) {
      return NextResponse.json(
        { 
          error: "Método de pagamento é obrigatório. Por favor, forneça os dados do cartão, um PaymentMethod ID válido, ou complete o checkout através da interface.",
          code: "PAYMENT_METHOD_REQUIRED"
        },
        { status: 400 }
      );
    }

    // Para PIX, criar PaymentIntent em vez de Subscription direta
    // PIX não suporta subscriptions recorrentes, então criamos subscription pendente
    // e geramos PaymentIntent PIX para o primeiro pagamento
    let subscription: any;
    let pixPaymentData: any = null;

    if (paymentMethodType === "PIX") {
      // Criar subscription pendente (sem payment method)
      subscription = await createSubscription({
        customerId: company.stripeCustomerId,
        priceId,
        paymentMethodId: undefined, // PIX não usa payment method
        trialPeriodDays: undefined, // Não aplicar trial para PIX
        metadata: {
          companyId: company.id,
          planId,
          billingCycle,
          paymentMethodType: "PIX",
        },
      });

      // Criar PaymentIntent PIX para o primeiro pagamento
      const pixAmount = Math.round(planPrice * 100); // Converter para centavos
      pixPaymentData = await createPixPayment({
        amount: pixAmount,
        customerId: company.stripeCustomerId,
        metadata: {
          companyId: company.id,
          planId,
          billingCycle,
          subscriptionId: subscription.id,
        },
      });
    } else {
      // Para cartão de crédito, criar subscription normalmente
      // Aplicar trial de 7 dias para planos mensais (não aplicar para anuais)
      const trialPeriodDays = billingCycle === "MONTHLY" ? 7 : undefined;

      subscription = await createSubscription({
        customerId: company.stripeCustomerId,
        priceId,
        paymentMethodId: finalPaymentMethodId,
        trialPeriodDays,
        metadata: {
          companyId: company.id,
          planId,
          billingCycle,
        },
      });
    }

    // Calcular próxima data de vencimento
    // Se tiver trial, a próxima cobrança será após o trial + período
    let nextDueDate: Date;
    const trialPeriodDays = billingCycle === "MONTHLY" && paymentMethodType !== "PIX" ? 7 : undefined;
    
    if (paymentMethodType === "PIX") {
      // Para PIX, próxima data será após 1 período (mensal ou anual)
      if (billingCycle === "YEARLY") {
        nextDueDate = addYears(new Date(), 1);
      } else {
        nextDueDate = addMonths(new Date(), 1);
      }
    } else if (trialPeriodDays) {
      // Trial de 7 dias + 1 mês
      nextDueDate = addMonths(new Date(), 1);
      nextDueDate.setDate(nextDueDate.getDate() + trialPeriodDays);
    } else if (billingCycle === "YEARLY") {
      nextDueDate = addYears(new Date(), 1);
    } else {
      nextDueDate = addMonths(new Date(), 1);
    }

    // Para PIX, status sempre será PENDING até o pagamento ser confirmado
    const subscriptionStatus = paymentMethodType === "PIX" 
      ? "PENDING" 
      : (subscription.status === "active" ? "ACTIVE" : "PENDING");

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
        status: subscriptionStatus,
        nextDueDate,
        cycle: billingCycle,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        planId,
        billingType: billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY",
        value: planPrice,
        status: subscriptionStatus,
        nextDueDate,
        cycle: billingCycle,
      },
    });

    // Se for PIX, criar registro de Payment no banco
    if (pixPaymentData && pixPaymentData.payment_intent) {
      await prisma.payment.create({
        data: {
          companyId: company.id,
          stripePaymentIntentId: pixPaymentData.payment_intent.id,
          value: planPrice,
          billingType: "PIX",
          dueDate: nextDueDate,
          status: "PENDING",
          pixQrCode: pixPaymentData.pix_qr_code || null,
          pixCopiaECola: pixPaymentData.pix_copia_e_cola || null,
        },
      });
    }

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
      // Se for PIX, incluir dados do QR Code
      ...(pixPaymentData && {
        pix: {
          qrCode: pixPaymentData.pix_qr_code,
          copiaECola: pixPaymentData.pix_copia_e_cola,
          expiresAt: pixPaymentData.expires_at,
          paymentIntentId: pixPaymentData.payment_intent.id,
        },
      }),
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

