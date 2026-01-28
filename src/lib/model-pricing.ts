/**
 * Preços por token dos modelos de IA
 * Valores em USD por 1.000 tokens
 * Fonte: OpenAI e Anthropic pricing (2024)
 */

export interface ModelPricing {
  inputPrice: number; // Preço por 1K tokens de input
  outputPrice: number; // Preço por 1K tokens de output
  model: string;
  provider: "openai" | "anthropic" | "google";
}

// Preços padrão (valores reais de 2024)
export const DEFAULT_MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI Models (DISABLED)
  /*
  "gpt-4-turbo": { ... },
  */

  // Google Gemini Models
  "gemini-pro": {
    model: "gemini-pro",
    provider: "google",
    inputPrice: 0.0005,
    outputPrice: 0.0015,
  },
  "gemini-1.5-pro": {
    model: "gemini-1.5-pro",
    provider: "google",
    inputPrice: 0.00125,
    outputPrice: 0.005,
  },
  "gemini-1.5-flash": {
    model: "gemini-1.5-flash",
    provider: "google",
    inputPrice: 0.000075,
    outputPrice: 0.0003,
  },
  "gemini-2.0-flash": {
    model: "gemini-2.0-flash",
    provider: "google",
    inputPrice: 0.0001,
    outputPrice: 0.0004,
  },
  "gemini-3-pro-preview": {
    model: "gemini-3-pro-preview",
    provider: "google",
    inputPrice: 0.00125,
    outputPrice: 0.005,
  },
};

/**
 * Busca preços configurados do banco de dados ou usa valores padrão
 */
export async function getModelPricing(model: string): Promise<ModelPricing> {
  const { prisma } = await import("@/lib/prisma");

  try {
    // Tentar buscar do banco
    const setting = await prisma.systemSettings.findUnique({
      where: { key: `model_pricing_${model}` },
    });

    if (setting?.value) {
      try {
        const pricing = JSON.parse(setting.value);
        return {
          model,
          provider: pricing.provider || "openai",
          inputPrice: pricing.inputPrice || DEFAULT_MODEL_PRICING[model]?.inputPrice || 0.01,
          outputPrice: pricing.outputPrice || DEFAULT_MODEL_PRICING[model]?.outputPrice || 0.03,
        };
      } catch {
        // Se falhar ao parsear, usar padrão
      }
    }
  } catch (error) {
    console.error(`[Model Pricing] Erro ao buscar preço para ${model}:`, error);
  }

  // Usar preço padrão ou fallback
  return DEFAULT_MODEL_PRICING[model] || {
    model,
    provider: "openai",
    inputPrice: 0.01,
    outputPrice: 0.03,
  };
}

/**
 * Calcula o custo estimado baseado no número de tokens
 * Assumindo uma proporção padrão de 70% input / 30% output
 */
export async function calculateTokenCost(
  tokens: number,
  model: string
): Promise<number> {
  const pricing = await getModelPricing(model);

  // Proporção padrão: 70% input, 30% output
  const inputTokens = Math.round(tokens * 0.7);
  const outputTokens = Math.round(tokens * 0.3);

  const inputCost = (inputTokens / 1000) * pricing.inputPrice;
  const outputCost = (outputTokens / 1000) * pricing.outputPrice;

  return inputCost + outputCost;
}

/**
 * Calcula custo médio por token (para estimativas rápidas)
 */
export async function getAverageTokenCost(model: string): Promise<number> {
  const pricing = await getModelPricing(model);

  // Média ponderada: 70% input, 30% output
  const avgPrice = (pricing.inputPrice * 0.7) + (pricing.outputPrice * 0.3);

  // Converter para custo por token (dividir por 1000)
  return avgPrice / 1000;
}

