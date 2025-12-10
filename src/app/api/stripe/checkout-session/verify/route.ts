import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripeInstance } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * GET - Verifica o status de uma Checkout Session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id é obrigatório" },
        { status: 400 }
      );
    }

    const stripe = await getStripeInstance();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    // Verificar se a sessão pertence à company do usuário
    if (checkoutSession.metadata?.companyId !== session.user.companyId) {
      return NextResponse.json(
        { error: "Sessão não pertence a esta empresa" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      status: checkoutSession.status,
      paymentStatus: checkoutSession.payment_status,
      subscriptionId: checkoutSession.subscription,
      planName: checkoutSession.metadata?.planId,
      trialEnd: checkoutSession.subscription
        ? (typeof checkoutSession.subscription === "object" && "trial_end" in checkoutSession.subscription
          ? checkoutSession.subscription.trial_end
          : null)
        : null,
    });
  } catch (error: any) {
    console.error("Erro ao verificar Checkout Session:", error);
    return NextResponse.json(
      {
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}


