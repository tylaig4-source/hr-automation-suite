import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe, verifyWebhookSignature } from "@/lib/stripe";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
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
      event = verifyWebhookSignature(body, signature, webhookSecret);
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
    await prisma.subscription.updateMany({
      where: {
        stripeSubscriptionId: typeof subscriptionId === "string"
          ? subscriptionId
          : subscriptionId.id,
      },
      data: {
        status: "OVERDUE",
      },
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id}`);

  const companyId = subscription.metadata?.companyId;
  if (!companyId) return;

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status === "active" ? "ACTIVE" : "PENDING",
        nextDueDate: new Date((subscription as any).current_period_end * 1000),
      },
    });
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

