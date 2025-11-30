import { z } from "zod";

// ==========================================
// SCHEMAS DE AUTENTICAÇÃO
// ==========================================

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ==========================================
// SCHEMAS DE EXECUÇÃO
// ==========================================

export const executeAgentSchema = z.object({
  inputs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.undefined()])),
});

export type ExecuteAgentInput = z.infer<typeof executeAgentSchema>;

// ==========================================
// SCHEMAS DE AVALIAÇÃO
// ==========================================

export const rateExecutionSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

export type RateExecutionInput = z.infer<typeof rateExecutionSchema>;

// ==========================================
// SCHEMAS DE EMPRESA
// ==========================================

export const companySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  slug: z.string().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

// ==========================================
// SCHEMAS DE TEMPLATE
// ==========================================

export const templateSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
  agentId: z.string(),
  inputs: z.record(z.string(), z.any()),
});

export type TemplateInput = z.infer<typeof templateSchema>;

// ==========================================
// HELPERS DE VALIDAÇÃO
// ==========================================

/**
 * Gera um schema Zod dinâmico baseado no inputSchema do agente
 */
export function generateDynamicSchema(inputSchema: {
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    maxLength?: number;
    min?: number;
    max?: number;
  }>;
}) {
  const shape: Record<string, z.ZodType> = {};

  for (const field of inputSchema.fields) {
    let fieldSchema: z.ZodType;

    switch (field.type) {
      case "text":
      case "textarea":
        fieldSchema = z.string();
        if (field.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            field.maxLength,
            `Máximo ${field.maxLength} caracteres`
          );
        }
        break;

      case "number":
        fieldSchema = z.number();
        if (field.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(field.min);
        }
        if (field.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(field.max);
        }
        break;

      case "email":
        fieldSchema = z.string().email("E-mail inválido");
        break;

      case "date":
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");
        break;

      case "select":
      case "multiselect":
        fieldSchema = z.string();
        break;

      default:
        fieldSchema = z.string();
    }

    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}

/**
 * Valida inputs contra o schema do agente
 */
export function validateAgentInputs(
  inputs: Record<string, unknown>,
  inputSchema: {
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      maxLength?: number;
      min?: number;
      max?: number;
    }>;
  }
): { success: boolean; errors?: Record<string, string> } {
  const schema = generateDynamicSchema(inputSchema);
  
  const result = schema.safeParse(inputs);
  
  if (result.success) {
    return { success: true };
  }
  
  const errors: Record<string, string> = {};
  for (const error of result.error.errors) {
    const path = error.path.join(".");
    errors[path] = error.message;
  }
  
  return { success: false, errors };
}

