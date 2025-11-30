import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { credits } = await request.json();

    if (!credits || typeof credits !== "number" || credits <= 0) {
      return NextResponse.json({ error: "Invalid credits amount" }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id: params.id },
      data: {
        credits: {
          increment: credits,
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        companyId: params.id,
        action: "ADD_CREDITS",
        resource: "Company",
        resourceId: params.id,
        details: { creditsAdded: credits, newTotal: company.credits },
      },
    });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: "Failed to add credits" },
      { status: 500 }
    );
  }
}

