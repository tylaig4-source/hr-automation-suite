import { NextResponse } from "next/server";
import { getAvailableProviders, getDefaultProvider } from "@/lib/ai-providers";

export async function GET() {
  const providers = getAvailableProviders();
  const defaultProvider = getDefaultProvider();

  return NextResponse.json({
    available: providers,
    default: defaultProvider,
    providers: [
      {
        id: "openai",
        name: "OpenAI GPT-4",
        available: providers.includes("openai"),
        description: "Modelo mais preciso para tarefas complexas",
      },
      {
        id: "gemini",
        name: "Google Gemini",
        available: providers.includes("gemini"),
        description: "Modelo rápido com boa qualidade",
      },
      {
        id: "auto",
        name: "Automático",
        available: providers.length > 0,
        description: "Usa o melhor provider disponível com fallback",
      },
    ],
  });
}

