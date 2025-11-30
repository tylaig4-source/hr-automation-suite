import { NextResponse } from "next/server";
import { testConnection } from "@/lib/stripe";

export async function POST() {
  try {
    const isConnected = await testConnection();

    if (isConnected) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Não foi possível conectar ao Stripe" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro ao testar conexão Stripe:", error);
    return NextResponse.json(
      { error: "Erro ao testar conexão" },
      { status: 500 }
    );
  }
}

