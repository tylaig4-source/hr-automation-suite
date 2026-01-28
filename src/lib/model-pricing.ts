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
  // OpenAI Models
  "gpt-4-turbo": {
    model: "gpt-4-turbo",
    provider: "openai",
    inputPrice: 0.01, // $0.01 per 1K tokens
    outputPrice: 0.03, // $0.03 per 1K tokens
  },
  "gpt-4-turbo-preview": {
    model: "gpt-4-turbo-preview",
    provider: "openai",
    inputPrice: 0.01,
    outputPrice: 0.03,
  },
  "gpt-4": {
    model: "gpt-4",
    provider: "openai",
    inputPrice: 0.03, // $0.03 per 1K tokens
    outputPrice: 0.06, // $0.06 per 1K tokens
  },
  "gpt-3.5-turbo": {
    model: "gpt-3.5-turbo",
    provider: "openai",
    inputPrice: 0.0015, // $0.0015 per 1K tokens
    outputPrice: 0.002, // $0.002 per 1K tokens
  },
  "gpt-4o": {
    model: "gpt-4o",
    provider: "openai",
    inputPrice: 0.005, // $0.005 per 1K tokens
    outputPrice: 0.015, // $0.015 per 1K tokens
  },
  "gpt-4o-mini": {
    model: "gpt-4o-mini",
    provider: "openai",
    inputPrice: 0.00015, // $0.00015 per 1K tokens
    outputPrice: 0.0006, // $0.0006 per 1K tokens
  },
  // Anthropic Claude Models
  "claude-3-opus": {
    model: "claude-3-opus",
    provider: "anthropic",
    inputPrice: 0.015, // $0.015 per 1K tokens
    outputPrice: 0.075, // $0.075 per 1K tokens
  },
  "claude-3-sonnet": {
    model: "claude-3-sonnet",
    provider: "anthropic",
    inputPrice: 0.003, // $0.003 per 1K tokens
    outputPrice: 0.015, // $0.015 per 1K tokens
  },
  "claude-3-haiku": {
    model: "claude-3-haiku",
    provider: "anthropic",
    inputPrice: 0.00025, // $0.00025 per 1K tokens
    outputPrice: 0.00125, // $0.00125 per 1K tokens
  },
  "claude-3-5-sonnet": {
    model: "claude-3-5-sonnet",
    provider: "anthropic",
    inputPrice: 0.003, // $0.003 per 1K tokens
    outputPrice: 0.015, // $0.015 per 1K tokens
  },
  // Google Gemini Models
  "gemini-pro": {
    model: "gemini-pro",
    provider: "google",
    inputPrice: 0.0005, // $0.0005 per 1K tokens
    outputPrice: 0.0015, // $0.0015 per 1K tokens
  },
  "gemini-1.5-pro": {
    model: "gemini-1.5-pro",
    provider: "google",
    inputPrice: 0.00125, // $0.00125 per 1K tokens
    outputPrice: 0.005, // $0.005 per 1K tokens
  },
  "gemini-1.5-flash": {
    model: "gemini-1.5-flash",
    provider: "google",
    inputPrice: 0.000075, // $0.000075 per 1K tokens
    outputPrice: 0.0003, // $0.0003 per 1K tokens
  },
  "gemini-2.0-flash": {
    model: "gemini-2.0-flash",
    provider: "google",
    inputPrice: 0.0001, // $0.0001 per 1K tokens
    outputPrice: 0.0004, // $0.0004 per 1K tokens
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

