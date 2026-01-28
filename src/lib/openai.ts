import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY não configurada. A execução de agentes não funcionará.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gemini-2.0-flash";
export const DEFAULT_MAX_TOKENS = 4000;
export const DEFAULT_TEMPERATURE = 0.7;

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  userPrompt: string;
}

export interface ChatCompletionResult {
  content: string;
  tokensUsed: number;
  model: string;
  finishReason: string | null;
}

/**
 * Executa uma chamada ao modelo de chat da OpenAI
 */
export async function createChatCompletion({
  model = DEFAULT_MODEL,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens = DEFAULT_MAX_TOKENS,
  systemPrompt,
  userPrompt,
}: ChatCompletionOptions): Promise<ChatCompletionResult> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    messages.push({
      role: "system",
      content: systemPrompt,
    });
  }

  messages.push({
    role: "user",
    content: userPrompt,
  });

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  const choice = response.choices[0];
  
  return {
    content: choice?.message?.content || "",
    tokensUsed: response.usage?.total_tokens || 0,
    model: response.model,
    finishReason: choice?.finish_reason || null,
  };
}

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
 * Verifica se o texto cabe no limite de tokens
 */
export function fitsInTokenLimit(text: string, limit: number = 8000): boolean {
  return estimateTokens(text) <= limit;
}

