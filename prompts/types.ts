// ===========================================
// HR AUTOMATION SUITE - Tipos dos Prompts
// ===========================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  orderIndex: number;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface InputField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "date" | "number" | "email" | "file";
  required: boolean;
  placeholder?: string;
  helperText?: string;
  maxLength?: number;
  rows?: number;
  options?: FieldOption[];
  min?: number;
  max?: number;
  defaultValue?: string | number;
}

export interface InputSchema {
  fields: InputField[];
}

export interface Agent {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  estimatedTimeSaved?: number; // em minutos
  inputSchema: InputSchema;
  systemPrompt: string;
  promptTemplate: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  isPremium?: boolean;
}

export interface ExecutionInput {
  [key: string]: string | number | boolean | undefined;
}

export interface ExecutionResult {
  id: string;
  output: string;
  formattedOutput?: string;
  tokensUsed?: number;
  executionTimeMs?: number;
  createdAt: Date;
}

