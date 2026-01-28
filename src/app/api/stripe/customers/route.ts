import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCustomer, findCustomerByEmail, isStripeConfigured } from "@/lib/stripe";

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
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Verificar se já tem customer no Stripe
    if (company.stripeCustomerId) {
      return NextResponse.json({
        success: true,
        customerId: company.stripeCustomerId,
        message: "Customer already exists",
      });
    }

    const user = company.users[0];

    // Verificar se já existe customer com esse email
    let stripeCustomer = await findCustomerByEmail(user.email);

    if (!stripeCustomer) {
      // Criar novo customer no Stripe
      stripeCustomer = await createCustomer({
        email: user.email,
        name: user.name || company.name,
        metadata: {
          companyId: company.id,
          companyName: company.name,
        },
      });
    }

    // Atualizar company com Stripe Customer ID
    await prisma.company.update({
      where: { id: company.id },
      data: {
        stripeCustomerId: stripeCustomer.id,
      },
    });

    return NextResponse.json({
      success: true,
      customerId: stripeCustomer.id,
      customer: stripeCustomer,
    });
  } catch (error) {
    console.error("Erro ao criar customer Stripe:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

