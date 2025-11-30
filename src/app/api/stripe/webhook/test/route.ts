import { NextResponse } from "next/server";

export async function POST() {
  // Webhook test endpoint - apenas retorna sucesso
  // O Stripe envia eventos reais para o endpoint principal
  return NextResponse.json({ 
    success: true,
    message: "Webhook endpoint está funcionando" 
  });
}

