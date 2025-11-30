// ==========================================
// HR AUTOMATION SUITE - Tipos TypeScript
// ==========================================

// Re-export dos tipos de prompts
export type { Category, Agent, InputField, InputSchema, ExecutionInput, ExecutionResult } from "../../prompts/types";

// ==========================================
// TIPOS DE USUÁRIO
// ==========================================

export type UserRole = 
  | "ADMIN"
  | "COMPANY_ADMIN"
  | "HR_MANAGER"
  | "HR_ANALYST"
  | "MANAGER"
  | "EMPLOYEE";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  companyId: string | null;
}

// ==========================================
// TIPOS DE EMPRESA
// ==========================================

export type CompanyPlan = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: CompanyPlan;
  maxUsers: number;
  maxExecutions: number;
  settings: CompanySettings | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  theme?: "light" | "dark" | "system";
  language?: string;
  customBranding?: {
    primaryColor?: string;
    logo?: string;
  };
}

// ==========================================
// TIPOS DE EXECUÇÃO
// ==========================================

export type ExecutionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Execution {
  id: string;
  userId: string;
  companyId: string | null;
  agentId: string;
  inputs: Record<string, unknown>;
  promptSent: string;
  output: string;
  tokensUsed: number | null;
  executionTimeMs: number | null;
  rating: number | null;
  feedback: string | null;
  status: ExecutionStatus;
  errorMessage: string | null;
  createdAt: Date;
}

export interface ExecutionWithAgent extends Execution {
  agent: {
    id: string;
    name: string;
    slug: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

// ==========================================
// TIPOS DE TEMPLATE
// ==========================================

export interface UserTemplate {
  id: string;
  userId: string;
  agentId: string;
  name: string;
  description: string | null;
  inputs: Record<string, unknown>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// TIPOS DE API
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ExecuteAgentRequest {
  inputs: Record<string, string | number | boolean | undefined>;
}

export interface ExecuteAgentResponse {
  id: string;
  output: string;
  tokensUsed: number;
  executionTimeMs: number;
  createdAt: Date;
}

// ==========================================
// TIPOS DE UI
// ==========================================

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
  external?: boolean;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// ==========================================
// TIPOS DE FORMULÁRIO
// ==========================================

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "number" | "email";
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// ==========================================
// TIPOS DE FILTRO
// ==========================================

export interface ExecutionFilters {
  agentId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ExecutionStatus;
}

export interface AgentFilters {
  categoryId?: string;
  search?: string;
  isPremium?: boolean;
}

