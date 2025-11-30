import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSubscription,
  cancelSubscription,
  PLAN_PRICES,
  type AsaasSubscription,
  type PlanId,
} from "@/lib/asaas";
import { addMonths, addYears, format } from "date-fns";

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
    const { planId, billingType, billingCycle = "MONTHLY", creditCard, creditCardHolderInfo } = body;

    if (!planId || !["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(planId)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    if (!billingType || !["PIX", "BOLETO", "CREDIT_CARD"].includes(billingType)) {
      return NextResponse.json(
        { error: "Invalid billing type" },
        { status: 400 }
      );
    }

    // Get company with Asaas customer ID
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

    if (!company.asaasCustomerId) {
      return NextResponse.json(
        { error: "No Asaas customer associated. Create customer first." },
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
    const value = billingCycle === "YEARLY" ? planPrice.yearly : planPrice.monthly;
    const cycle = billingCycle === "YEARLY" ? "YEARLY" : "MONTHLY";

    // Calculate next due date (today + 1 day for first payment)
    const nextDueDate = format(new Date(), "yyyy-MM-dd");

    // Prepare subscription data
    const subscriptionData: AsaasSubscription = {
      customer: company.asaasCustomerId,
      billingType: billingType as "PIX" | "BOLETO" | "CREDIT_CARD",
      value,
      nextDueDate,
      cycle,
      description: `HR Suite - Plano ${planId}`,
      externalReference: company.id,
    };

    // Add credit card info if paying with card
    if (billingType === "CREDIT_CARD" && creditCard) {
      subscriptionData.creditCard = creditCard;
      subscriptionData.creditCardHolderInfo = creditCardHolderInfo;
    }

    // Create subscription in Asaas
    const asaasSubscription = await createSubscription(subscriptionData);

    if (!asaasSubscription.id) {
      throw new Error("Failed to create subscription in Asaas");
    }

    // Calculate subscription end date for display
    const subscriptionNextDue = billingCycle === "YEARLY"
      ? addYears(new Date(), 1)
      : addMonths(new Date(), 1);

    // Create or update subscription in database
    const subscription = await prisma.subscription.upsert({
      where: { companyId: company.id },
      create: {
        companyId: company.id,
        asaasSubscriptionId: asaasSubscription.id,
        planId,
        billingType: billingCycle as any,
        value,
        status: "PENDING",
        nextDueDate: subscriptionNextDue,
        cycle,
      },
      update: {
        asaasSubscriptionId: asaasSubscription.id,
        planId,
        billingType: billingCycle as any,
        value,
        status: "PENDING",
        nextDueDate: subscriptionNextDue,
        cycle,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        action: "CREATE_SUBSCRIPTION",
        resource: "Subscription",
        resourceId: subscription.id,
        details: {
          planId,
          billingType,
          billingCycle,
          value,
          asaasSubscriptionId: asaasSubscription.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      asaasSubscriptionId: asaasSubscription.id,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription" },
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
        { error: "Unauthorized or no company associated" },
        { status: 401 }
      );
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: session.user.companyId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    if (!subscription.asaasSubscriptionId) {
      return NextResponse.json(
        { error: "No Asaas subscription associated" },
        { status: 400 }
      );
    }

    // Cancel in Asaas
    await cancelSubscription(subscription.asaasSubscriptionId);

    // Update in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELED",
        endDate: new Date(),
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: session.user.companyId,
        action: "CANCEL_SUBSCRIPTION",
        resource: "Subscription",
        resourceId: subscription.id,
        details: { asaasSubscriptionId: subscription.asaasSubscriptionId },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription canceled",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}

