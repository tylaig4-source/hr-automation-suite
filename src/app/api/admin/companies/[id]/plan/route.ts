import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const planLimits = {
  STARTER: { maxUsers: 2, maxExecutions: 100 },
  PROFESSIONAL: { maxUsers: 10, maxExecutions: 500 },
  ENTERPRISE: { maxUsers: 9999, maxExecutions: 99999 },
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || !["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const limits = planLimits[plan as keyof typeof planLimits];

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        plan: plan as any,
        maxUsers: limits.maxUsers,
        maxExecutions: limits.maxExecutions,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: params.id,
        action: "UPDATE_PLAN",
        resource: "Company",
        resourceId: params.id,
        details: { newPlan: plan, oldPlan: company.plan },
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

