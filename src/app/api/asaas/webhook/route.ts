import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookToken } from "@/lib/asaas";

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    id: string;
    customer: string;
    subscription: string | null;
    value: number;
    netValue: number;
    billingType: string;
    status: string;
    dueDate: string;
    paymentDate: string | null;
    description: string | null;
    externalReference: string | null;
    invoiceUrl: string | null;
    bankSlipUrl: string | null;
  };
  subscription?: {
    id: string;
    customer: string;
    value: number;
    billingType: string;
    status: string;
    nextDueDate: string;
    cycle: string;
    externalReference: string | null;
  };
}

// Plan limits mapping
const planLimits = {
  STARTER: { maxUsers: 2, maxExecutions: 100, credits: 50 },
  PROFESSIONAL: { maxUsers: 10, maxExecutions: 500, credits: 500 },
  ENTERPRISE: { maxUsers: 9999, maxExecutions: 99999, credits: 9999 },
};

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token if configured
    const token = request.headers.get("asaas-access-token");
    if (token && !verifyWebhookToken(token)) {
      console.warn("Invalid webhook token received");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const payload: AsaasWebhookPayload = await request.json();
    const { event } = payload;

    console.log(`[Asaas Webhook] Event received: ${event}`);

    // Log webhook for debugging
    await prisma.webhookLog.create({
      data: {
        event,
        payload: payload as any,
        status: "PROCESSING",
      },
    });

    // Process event
    switch (event) {
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED":
        await handlePaymentReceived(payload);
        break;

      case "PAYMENT_OVERDUE":
        await handlePaymentOverdue(payload);
        break;

      case "PAYMENT_DELETED":
      case "PAYMENT_REFUNDED":
        await handlePaymentCanceled(payload);
        break;

      case "SUBSCRIPTION_CREATED":
        await handleSubscriptionCreated(payload);
        break;

      case "SUBSCRIPTION_UPDATED":
        await handleSubscriptionUpdated(payload);
        break;

      case "SUBSCRIPTION_DELETED":
        await handleSubscriptionDeleted(payload);
        break;

      default:
        console.log(`[Asaas Webhook] Unhandled event: ${event}`);
    }

    // Update log status
    await prisma.webhookLog.updateMany({
      where: {
        event,
        status: "PROCESSING",
      },
      data: {
        status: "SUCCESS",
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Asaas Webhook] Error:", error);

    // Log error
    await prisma.webhookLog.create({
      data: {
        event: "ERROR",
        payload: { error: error instanceof Error ? error.message : "Unknown error" },
        status: "ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentReceived(payload: AsaasWebhookPayload) {
  const payment = payload.payment;
  if (!payment) return;

  console.log(`[Asaas Webhook] Payment received: ${payment.id}`);

  // Find company by external reference or subscription
  let company = null;

  if (payment.externalReference) {
    company = await prisma.company.findUnique({
      where: { id: payment.externalReference },
      include: { subscription: true },
    });
  }

  if (!company && payment.subscription) {
    const subscription = await prisma.subscription.findUnique({
      where: { asaasSubscriptionId: payment.subscription },
      include: { company: true },
    });
    company = subscription?.company;
  }

  if (!company) {
    console.warn(`[Asaas Webhook] Company not found for payment: ${payment.id}`);
    return;
  }

  // Create or update payment record
  await prisma.payment.upsert({
    where: { asaasPaymentId: payment.id },
    create: {
      companyId: company.id,
      asaasPaymentId: payment.id,
      value: payment.value,
      netValue: payment.netValue,
      billingType: payment.billingType as any,
      status: "RECEIVED",
      dueDate: new Date(payment.dueDate),
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
    },
    update: {
      status: "RECEIVED",
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
    },
  });

  // Activate subscription if exists
  if (company.subscription) {
    await prisma.subscription.update({
      where: { id: company.subscription.id },
      data: {
        status: "ACTIVE",
        nextDueDate: payment.subscription
          ? await getNextDueDate(payment.subscription)
          : null,
      },
    });

    // Update company plan and limits
    const planId = company.subscription.planId as keyof typeof planLimits;
    const limits = planLimits[planId] || planLimits.STARTER;

    await prisma.company.update({
      where: { id: company.id },
      data: {
        plan: planId as any,
        maxUsers: limits.maxUsers,
        maxExecutions: limits.maxExecutions,
        credits: { increment: limits.credits },
      },
    });
  }

  // Send notification to company admin
  const companyAdmin = await prisma.user.findFirst({
    where: {
      companyId: company.id,
      role: { in: ["COMPANY_ADMIN", "ADMIN"] },
    },
  });

  if (companyAdmin) {
    await prisma.notification.create({
      data: {
        userId: companyAdmin.id,
        title: "Pagamento Confirmado",
        message: `Seu pagamento de R$ ${payment.value.toFixed(2)} foi confirmado com sucesso.`,
        type: "SUCCESS",
        link: "/dashboard/plans",
      },
    });
  }
}

async function handlePaymentOverdue(payload: AsaasWebhookPayload) {
  const payment = payload.payment;
  if (!payment) return;

  console.log(`[Asaas Webhook] Payment overdue: ${payment.id}`);

  // Update payment status
  await prisma.payment.updateMany({
    where: { asaasPaymentId: payment.id },
    data: { status: "OVERDUE" },
  });

  // Find company
  let company = null;

  if (payment.externalReference) {
    company = await prisma.company.findUnique({
      where: { id: payment.externalReference },
    });
  }

  if (!company && payment.subscription) {
    const subscription = await prisma.subscription.findUnique({
      where: { asaasSubscriptionId: payment.subscription },
      include: { company: true },
    });
    company = subscription?.company;
  }

  if (!company) return;

  // Update subscription status
  await prisma.subscription.updateMany({
    where: { companyId: company.id },
    data: { status: "OVERDUE" },
  });

  // Send notification
  const companyAdmin = await prisma.user.findFirst({
    where: {
      companyId: company.id,
      role: { in: ["COMPANY_ADMIN", "ADMIN"] },
    },
  });

  if (companyAdmin) {
    await prisma.notification.create({
      data: {
        userId: companyAdmin.id,
        title: "Pagamento Vencido",
        message: `Seu pagamento de R$ ${payment.value.toFixed(2)} está vencido. Por favor, regularize para manter o acesso.`,
        type: "WARNING",
        link: "/dashboard/plans",
      },
    });
  }
}

async function handlePaymentCanceled(payload: AsaasWebhookPayload) {
  const payment = payload.payment;
  if (!payment) return;

  console.log(`[Asaas Webhook] Payment canceled/refunded: ${payment.id}`);

  // Update payment status
  await prisma.payment.updateMany({
    where: { asaasPaymentId: payment.id },
    data: { status: "REFUNDED" },
  });
}

async function handleSubscriptionCreated(payload: AsaasWebhookPayload) {
  const subscription = payload.subscription;
  if (!subscription) return;

  console.log(`[Asaas Webhook] Subscription created: ${subscription.id}`);

  // Find company
  const company = subscription.externalReference
    ? await prisma.company.findUnique({
        where: { id: subscription.externalReference },
      })
    : null;

  if (!company) {
    console.warn(`[Asaas Webhook] Company not found for subscription: ${subscription.id}`);
    return;
  }

  // Create subscription record
  await prisma.subscription.upsert({
    where: { companyId: company.id },
    create: {
      companyId: company.id,
      asaasSubscriptionId: subscription.id,
      planId: "STARTER", // Will be updated with proper plan
      value: subscription.value,
      status: "PENDING",
      cycle: subscription.cycle,
      nextDueDate: new Date(subscription.nextDueDate),
    },
    update: {
      asaasSubscriptionId: subscription.id,
      value: subscription.value,
      nextDueDate: new Date(subscription.nextDueDate),
    },
  });
}

async function handleSubscriptionUpdated(payload: AsaasWebhookPayload) {
  const subscription = payload.subscription;
  if (!subscription) return;

  console.log(`[Asaas Webhook] Subscription updated: ${subscription.id}`);

  await prisma.subscription.updateMany({
    where: { asaasSubscriptionId: subscription.id },
    data: {
      value: subscription.value,
      nextDueDate: new Date(subscription.nextDueDate),
      status: subscription.status === "ACTIVE" ? "ACTIVE" : "PENDING",
    },
  });
}

async function handleSubscriptionDeleted(payload: AsaasWebhookPayload) {
  const subscription = payload.subscription;
  if (!subscription) return;

  console.log(`[Asaas Webhook] Subscription deleted: ${subscription.id}`);

  const dbSubscription = await prisma.subscription.findUnique({
    where: { asaasSubscriptionId: subscription.id },
    include: { company: true },
  });

  if (!dbSubscription) return;

  // Update subscription status
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: "CANCELED",
      endDate: new Date(),
    },
  });

  // Downgrade company to STARTER
  await prisma.company.update({
    where: { id: dbSubscription.companyId },
    data: {
      plan: "STARTER",
      maxUsers: 2,
      maxExecutions: 100,
    },
  });

  // Send notification
  const companyAdmin = await prisma.user.findFirst({
    where: {
      companyId: dbSubscription.companyId,
      role: { in: ["COMPANY_ADMIN", "ADMIN"] },
    },
  });

  if (companyAdmin) {
    await prisma.notification.create({
      data: {
        userId: companyAdmin.id,
        title: "Assinatura Cancelada",
        message: "Sua assinatura foi cancelada. Você foi movido para o plano gratuito.",
        type: "WARNING",
        link: "/dashboard/plans",
      },
    });
  }
}

async function getNextDueDate(subscriptionId: string): Promise<Date | null> {
  try {
    const { getSubscription } = await import("@/lib/asaas");
    const subscription = await getSubscription(subscriptionId);
    return subscription.nextDueDate ? new Date(subscription.nextDueDate) : null;
  } catch {
    return null;
  }
}

