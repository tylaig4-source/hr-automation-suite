/**
 * Asaas API Integration
 * Documentation: https://docs.asaas.com/reference
 */

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || "sandbox";

const BASE_URL = ASAAS_ENVIRONMENT === "production"
  ? "https://api.asaas.com/v3"
  : "https://sandbox.asaas.com/api/v3";

// ============================================
// Types
// ============================================

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  country?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  groupName?: string;
  company?: string;
}

export interface AsaasSubscription {
  id?: string;
  customer: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  nextDueDate: string;
  discount?: {
    value: number;
    dueDateLimitDays: number;
    type: "FIXED" | "PERCENTAGE";
  };
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
  };
  cycle: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY";
  description?: string;
  endDate?: string;
  maxPayments?: number;
  externalReference?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  creditCardToken?: string;
}

export interface AsaasPayment {
  id?: string;
  customer: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value: number;
    dueDateLimitDays: number;
    type: "FIXED" | "PERCENTAGE";
  };
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
  };
  postalService?: boolean;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  creditCardToken?: string;
}

export interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string | null;
  dueDate: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  description: string | null;
  externalReference: string | null;
  confirmedDate: string | null;
  originalValue: number | null;
  interestValue: number | null;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number | null;
  transactionReceiptUrl: string | null;
  nossoNumero: string | null;
  invoiceUrl: string;
  bankSlipUrl: string | null;
  invoiceNumber: string | null;
  deleted: boolean;
  postalService: boolean;
  anticipated: boolean;
  split: any[] | null;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasError {
  errors: Array<{
    code: string;
    description: string;
  }>;
}

// ============================================
// API Client
// ============================================

async function asaasRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY is not configured");
  }

  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "access_token": ASAAS_API_KEY,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as AsaasError;
    throw new Error(
      error.errors?.map((e) => e.description).join(", ") ||
        `Asaas API error: ${response.status}`
    );
  }

  return data as T;
}

// ============================================
// Customer Methods
// ============================================

export async function createCustomer(customer: AsaasCustomer): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(customer),
  });
}

export async function getCustomer(id: string): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>(`/customers/${id}`);
}

export async function updateCustomer(
  id: string,
  customer: Partial<AsaasCustomer>
): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customer),
  });
}

export async function deleteCustomer(id: string): Promise<{ deleted: boolean }> {
  return asaasRequest<{ deleted: boolean }>(`/customers/${id}`, {
    method: "DELETE",
  });
}

export async function findCustomerByEmail(email: string): Promise<AsaasCustomer | null> {
  const result = await asaasRequest<{ data: AsaasCustomer[] }>(
    `/customers?email=${encodeURIComponent(email)}`
  );
  return result.data[0] || null;
}

export async function findCustomerByCpfCnpj(cpfCnpj: string): Promise<AsaasCustomer | null> {
  const result = await asaasRequest<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`
  );
  return result.data[0] || null;
}

// ============================================
// Subscription Methods
// ============================================

export async function createSubscription(
  subscription: AsaasSubscription
): Promise<AsaasSubscription & { id: string }> {
  return asaasRequest<AsaasSubscription & { id: string }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

export async function getSubscription(id: string): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>(`/subscriptions/${id}`);
}

export async function updateSubscription(
  id: string,
  subscription: Partial<AsaasSubscription>
): Promise<AsaasSubscription> {
  return asaasRequest<AsaasSubscription>(`/subscriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(subscription),
  });
}

export async function cancelSubscription(id: string): Promise<{ deleted: boolean }> {
  return asaasRequest<{ deleted: boolean }>(`/subscriptions/${id}`, {
    method: "DELETE",
  });
}

export async function getSubscriptionPayments(
  subscriptionId: string
): Promise<{ data: AsaasPaymentResponse[] }> {
  return asaasRequest<{ data: AsaasPaymentResponse[] }>(
    `/subscriptions/${subscriptionId}/payments`
  );
}

// ============================================
// Payment Methods
// ============================================

export async function createPayment(payment: AsaasPayment): Promise<AsaasPaymentResponse> {
  return asaasRequest<AsaasPaymentResponse>("/payments", {
    method: "POST",
    body: JSON.stringify(payment),
  });
}

export async function getPayment(id: string): Promise<AsaasPaymentResponse> {
  return asaasRequest<AsaasPaymentResponse>(`/payments/${id}`);
}

export async function getPaymentPixQrCode(id: string): Promise<AsaasPixQrCode> {
  return asaasRequest<AsaasPixQrCode>(`/payments/${id}/pixQrCode`);
}

export async function getPaymentBankSlip(id: string): Promise<{ url: string }> {
  return asaasRequest<{ url: string }>(`/payments/${id}/identificationField`);
}

export async function cancelPayment(id: string): Promise<AsaasPaymentResponse> {
  return asaasRequest<AsaasPaymentResponse>(`/payments/${id}`, {
    method: "DELETE",
  });
}

export async function refundPayment(
  id: string,
  value?: number
): Promise<AsaasPaymentResponse> {
  return asaasRequest<AsaasPaymentResponse>(`/payments/${id}/refund`, {
    method: "POST",
    body: value ? JSON.stringify({ value }) : undefined,
  });
}

export async function listPayments(params?: {
  customer?: string;
  subscription?: string;
  status?: string;
  offset?: number;
  limit?: number;
}): Promise<{ data: AsaasPaymentResponse[]; totalCount: number }> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return asaasRequest<{ data: AsaasPaymentResponse[]; totalCount: number }>(
    `/payments${query ? `?${query}` : ""}`
  );
}

// ============================================
// Tokenization (Credit Card)
// ============================================

export async function tokenizeCreditCard(
  customerId: string,
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  },
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  }
): Promise<{ creditCardNumber: string; creditCardBrand: string; creditCardToken: string }> {
  return asaasRequest<{
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
  }>("/creditCard/tokenize", {
    method: "POST",
    body: JSON.stringify({
      customer: customerId,
      creditCard,
      creditCardHolderInfo,
    }),
  });
}

// ============================================
// Account/Balance
// ============================================

export async function getBalance(): Promise<{ balance: number }> {
  return asaasRequest<{ balance: number }>("/finance/balance");
}

export async function testConnection(): Promise<boolean> {
  try {
    await getBalance();
    return true;
  } catch {
    return false;
  }
}

// ============================================
// Plan Prices
// ============================================

export const PLAN_PRICES = {
  PROFESSIONAL: {
    monthly: 597,       // R$597/mês (cartão recorrente ou PIX mensal)
    yearly: 497,        // R$497/mês no plano anual
    yearlyTotal: 5964,  // R$5.964/ano (12x R$497)
    yearlySavings: 1200, // Economia de R$1.200/ano vs mensal
  },
  ENTERPRISE: {
    monthly: null,      // Customizado
    yearly: null,       // Customizado
    yearlyTotal: null,
    yearlySavings: null,
  },
} as const;

// Preços adicionais
export const EXTRA_PRICES = {
  additionalUser: 97,    // R$97/mês por usuário adicional
  overageRequest: 0.50,  // R$0,50 por requisição excedente
} as const;

export type PlanId = keyof typeof PLAN_PRICES;

// ============================================
// Webhook Verification
// ============================================

export function verifyWebhookToken(token: string): boolean {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expectedToken) {
    console.warn("ASAAS_WEBHOOK_TOKEN not configured, skipping verification");
    return true;
  }
  return token === expectedToken;
}

