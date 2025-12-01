import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, getStripeInstance } from "@/lib/stripe";
import { getStripeWebhookSecret } from "@/lib/stripe-settings";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Buscar webhook secret do banco ou env
    const dbWebhookSecret = await getStripeWebhookSecret();
    const envWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const webhookSecret = dbWebhookSecret || envWebhookSecret;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verificar assinatura do webhook
    let event: Stripe.Event;
    try {
      event = await verifyWebhookSignature(body, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Event received: ${event.type}`);

    // Log webhook
    await prisma.webhookLog.create({
      data: {
        event: event.type,
        payload: event as any,
        status: "PROCESSING",
      },
    });

    // Processar evento
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    // Atualizar log
    await prisma.webhookLog.updateMany({
      where: {
        event: event.type,
        status: "PROCESSING",
      },
      data: {
        status: "SUCCESS",
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment succeeded: ${paymentIntent.id}`);

  const companyId = paymentIntent.metadata?.companyId;
  if (!companyId) {
    console.warn(`[Stripe Webhook] No companyId in metadata for payment: ${paymentIntent.id}`);
    return;
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    console.warn(`[Stripe Webhook] Company not found: ${companyId}`);
    return;
  }

  // Buscar charge associado
  const stripe = await getStripeInstance();
  const charges = await stripe.charges.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  });
  const charge = charges.data[0];

  // Criar ou atualizar payment record
  await prisma.payment.upsert({
    where: { stripePaymentIntentId: paymentIntent.id },
    create: {
      companyId: company.id,
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: charge?.id || null,
      value: paymentIntent.amount / 100, // Converter de centavos
      netValue: charge ? (charge.amount - (charge.application_fee_amount || 0)) / 100 : paymentIntent.amount / 100,
      billingType: (paymentIntent.payment_method_types[0]?.toUpperCase() || "CREDIT_CARD") as any,
      status: "RECEIVED",
      dueDate: new Date(paymentIntent.created * 1000),
      paymentDate: new Date(),
    },
    update: {
      status: "RECEIVED",
      paymentDate: new Date(),
    },
  });

  // Atualizar subscription se existir
  if (paymentIntent.metadata?.subscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: paymentIntent.metadata.subscriptionId },
      data: {
        status: "ACTIVE",
      },
    });
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);

  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: {
      status: "OVERDUE",
    },
  });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Invoice payment succeeded: ${invoice.id}`);

  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    const stripe = await getStripeInstance();
    const subscription = typeof subscriptionId === "string"
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : subscriptionId;

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: "ACTIVE",
        nextDueDate: new Date((subscription as any).current_period_end * 1000),
      },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);

  const subscriptionId = (invoice as any).subscription;
  if (subscriptionId) {
    const stripe = await getStripeInstance();
    const subscription = typeof subscriptionId === "string"
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : subscriptionId;

    // Atualizar status da assinatura
    const updatedSubscription = await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        status: "OVERDUE",
      },
    });

    // Buscar empresa associada
    const subscriptionRecord = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { companyId: true, company: { select: { users: { select: { id: true } } } } },
    });

    if (subscriptionRecord) {
      // Criar notificação para todos os usuários da empresa
      const userIds = subscriptionRecord.company.users.map(u => u.id);
      
      await Promise.all(
        userIds.map(userId =>
          prisma.notification.create({
            data: {
              userId,
              title: "⚠️ Pagamento Falhou",
              message: `O pagamento da sua assinatura falhou. Por favor, atualize seu método de pagamento para continuar usando a plataforma.`,
              type: "WARNING",
            },
          })
        )
      );

      console.log(`[Stripe Webhook] Notificações de pagamento falho criadas para empresa ${subscriptionRecord.companyId}`);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id}`);

  const companyId = subscription.metadata?.companyId;
  if (!companyId) return;

  // Mapear status do Stripe para nosso enum
  let status: "PENDING" | "ACTIVE" | "OVERDUE" | "CANCELED" | "EXPIRED" = "PENDING";
  if (subscription.status === "active") {
    status = "ACTIVE";
  } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
    status = "OVERDUE";
  } else if (subscription.status === "canceled") {
    status = "CANCELED";
  } else if (subscription.status === "incomplete_expired") {
    status = "EXPIRED";
  }

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status,
      nextDueDate: new Date((subscription as any).current_period_end * 1000),
    },
  });

  // Se status mudou para OVERDUE, criar notificações
  if (status === "OVERDUE") {
    const subscriptionRecord = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      select: { companyId: true, company: { select: { users: { select: { id: true } } } } },
    });

    if (subscriptionRecord) {
      const userIds = subscriptionRecord.company.users.map(u => u.id);
      
      await Promise.all(
        userIds.map(userId =>
          prisma.notification.create({
            data: {
              userId,
              title: "⚠️ Assinatura em Atraso",
              message: `Sua assinatura está em atraso. Atualize seu método de pagamento para evitar interrupção do serviço.`,
              type: "WARNING",
            },
          })
        )
      );
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`);

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELED",
      endDate: new Date(),
    },
  });
}

