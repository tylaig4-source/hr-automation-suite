// ==========================================
// HR AUTOMATION SUITE - Multi-Provider AI
// ==========================================
// Suporte a OpenAI, Google Gemini, e fallbacks

import OpenAI from "openai";

// ==========================================
// TIPOS
// ==========================================

export type AIProvider = "openai" | "gemini" | "auto";

export interface AICompletionOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  userPrompt: string;
}

export interface AICompletionResult {
  content: string;
  tokensUsed: number;
  model: string;
  provider: AIProvider;
  finishReason: string | null;
}

// ==========================================
// CONFIGURAÇÕES DOS PROVIDERS
// ==========================================

const PROVIDER_CONFIG = {
  openai: {
    defaultModel: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
    maxTokens: 4000,
  },
  gemini: {
    defaultModel: process.env.GEMINI_MODEL || "gemini-1.5-pro",
    maxTokens: 8000,
  },
};

const STRICT_OUTPUT_INSTRUCTION = "\n\nIMPORTANT: Return ONLY the requested content. Do not include introductory or concluding remarks. Output must be in Markdown format.";

// ==========================================
// OPENAI CLIENT
// ==========================================

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

async function callOpenAI(options: AICompletionOptions): Promise<AICompletionResult> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI API key não configurada");
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt + STRICT_OUTPUT_INSTRUCTION });
  } else {
    messages.push({ role: "system", content: STRICT_OUTPUT_INSTRUCTION });
  }
  messages.push({ role: "user", content: options.userPrompt });

  const model = options.model || PROVIDER_CONFIG.openai.defaultModel;

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? PROVIDER_CONFIG.openai.maxTokens,
  });

  const choice = response.choices[0];

  return {
    content: choice?.message?.content || "",
    tokensUsed: response.usage?.total_tokens || 0,
    model: response.model,
    provider: "openai",
    finishReason: choice?.finish_reason || null,
  };
}

// ==========================================
// GOOGLE GEMINI CLIENT
// ==========================================

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

async function callGemini(options: AICompletionOptions): Promise<AICompletionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key não configurada");
  }

  let model = options.model || PROVIDER_CONFIG.gemini.defaultModel;

  // Se o model vier da configuração do agente (ex: gpt-4), ignorar e usar o default do Gemini
  if (model.includes("gpt-") || model.includes("dall-e") || model.includes("text-")) {
    model = PROVIDER_CONFIG.gemini.defaultModel;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Monta o prompt combinando system + user
  let fullPrompt = options.userPrompt;
  if (options.systemPrompt) {
    fullPrompt = `${options.systemPrompt}${STRICT_OUTPUT_INSTRUCTION}\n\n---\n\n${options.userPrompt}`;
  } else {
    fullPrompt = `${STRICT_OUTPUT_INSTRUCTION}\n\n---\n\n${options.userPrompt}`;
  }

  const body = {
    contents: [
      {
        parts: [{ text: fullPrompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? PROVIDER_CONFIG.gemini.maxTokens,
      topP: 0.95,
      topK: 40,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API Error:", error);
    throw new Error(`Erro na API Gemini: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const tokensUsed = data.usageMetadata?.totalTokenCount || 0;
  const finishReason = data.candidates?.[0]?.finishReason || null;

  return {
    content,
    tokensUsed,
    model,
    provider: "gemini",
    finishReason,
  };
}

// ==========================================
// FUNÇÃO PRINCIPAL - AUTO FALLBACK
// ==========================================

/**
 * Executa uma chamada de IA com suporte a múltiplos providers.
 * 
 * - `auto`: Tenta OpenAI primeiro, depois Gemini como fallback
 * - `openai`: Usa apenas OpenAI
 * - `gemini`: Usa apenas Gemini
 */
export async function createAICompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const provider = options.provider || "auto";

  // Provider específico
  if (provider === "openai") {
    return callOpenAI(options);
  }

  if (provider === "gemini") {
    return callGemini(options);
  }

  // Auto: tenta providers na ordem de preferência
  const providers: AIProvider[] = [];

  // Define ordem baseado nas keys disponíveis
  if (process.env.OPENAI_API_KEY) {
    providers.push("openai");
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push("gemini");
  }

  if (providers.length === 0) {
    throw new Error(
      "Nenhum provider de IA configurado. Configure OPENAI_API_KEY ou GEMINI_API_KEY."
    );
  }

  let lastError: Error | null = null;

  for (const p of providers) {
    try {
      console.log(`[AI] Tentando provider: ${p}`);

      if (p === "openai") {
        return await callOpenAI(options);
      }
      if (p === "gemini") {
        return await callGemini(options);
      }
    } catch (error) {
      console.error(`[AI] Erro com provider ${p}:`, error);
      lastError = error as Error;
      // Continua para o próximo provider
    }
  }

  throw lastError || new Error("Todos os providers de IA falharam");
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Substitui variáveis {{campo}} no template pelo valor
 */
export function buildPromptFromTemplate(
  template: string,
  variables: Record<string, string | number | boolean | undefined>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, String(value ?? ""));
  }

  // Remove variáveis não substituídas
  result = result.replace(/{{[^}]+}}/g, "");

  return result.trim();
}

/**
 * Estima o número de tokens em um texto (aproximação)
 */
export function estimateTokens(text: string): number {
  // Aproximação: 1 token ≈ 4 caracteres em inglês
  // Para português, pode ser um pouco mais
  return Math.ceil(text.length / 3.5);
}

/**
 * Verifica quais providers estão configurados
 */
export function getAvailableProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.OPENAI_API_KEY) providers.push("openai");
  if (process.env.GEMINI_API_KEY) providers.push("gemini");
  return providers;
}

/**
 * Retorna o provider padrão (primeiro disponível)
 */
export function getDefaultProvider(): AIProvider | null {
  const providers = getAvailableProviders();
  return providers[0] || null;
}

