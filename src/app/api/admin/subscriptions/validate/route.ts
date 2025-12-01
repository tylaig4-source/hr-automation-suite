import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAllActiveSubscriptions, validateSubscriptionWithStripe } from "@/lib/subscription-utils";

export const dynamic = 'force-dynamic';

/**
 * Rota para validar TODAS as assinaturas ACTIVE com o Stripe
 * Detecta manipulações ou inconsistências no banco de dados
 * Apenas ADMIN pode executar
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem executar esta ação" },
        { status: 403 }
      );
    }

    const results = await validateAllActiveSubscriptions();

    return NextResponse.json({
      success: true,
      message: "Validação de assinaturas concluída",
      results,
    });
  } catch (error: any) {
    console.error("Erro ao validar assinaturas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao validar assinaturas" },
      { status: 500 }
    );
  }
}

/**
 * GET para validar uma assinatura específica
 * Útil para debug ou verificação pontual
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Apenas administradores podem executar esta ação" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscriptionId");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId é obrigatório" },
        { status: 400 }
      );
    }

    const validation = await validateSubscriptionWithStripe(subscriptionId);

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (error: any) {
    console.error("Erro ao validar assinatura:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao validar assinatura" },
      { status: 500 }
    );
  }
}

