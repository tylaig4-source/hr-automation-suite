/**
 * Stripe API Integration
 * Documentation: https://stripe.com/docs/api
 * PIX Support: https://stripe.com/docs/payments/pix
 */

import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-settings";

// Lazy initialization - só cria a instância quando necessário
let stripeInstance: Stripe | null = null;
let stripeSecretKey: string | null = null;

/**
 * Invalida o cache do Stripe (força recriação na próxima chamada)
 */
export function invalidateStripeCache() {
  stripeInstance = null;
  stripeSecretKey = null;
}


/**
 * Inicializa a instância do Stripe com a chave do banco ou env (fallback)
 */
async function getStripe(): Promise<Stripe> {
  if (!stripeInstance || stripeSecretKey === null) {
    // Tenta buscar do banco primeiro
    const dbKey = await getStripeSecretKey();
    
    // Fallback para env (para compatibilidade)
    const envKey = process.env.STRIPE_SECRET_KEY;
    
    const secretKey = dbKey || envKey;
    
    // Durante o build, sempre permite usar uma chave dummy para não quebrar
    const keyToUse = secretKey || "sk_test_dummy";
    
    stripeSecretKey = keyToUse;
    
    stripeInstance = new Stripe(keyToUse, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Helper para verificar se Stripe está configurado
export async function isStripeConfigured(): Promise<boolean> {
  const dbKey = await getStripeSecretKey();
  const envKey = process.env.STRIPE_SECRET_KEY;
  
  const secretKey = dbKey || envKey;
  return !!secretKey && secretKey !== "sk_test_dummy";
}

// Exporta uma função getter ao invés de instância direta
// Nota: Agora getStripe é async, então precisamos usar uma abordagem diferente
export async function getStripeInstance(): Promise<Stripe> {
  return await getStripe();
}

// Para compatibilidade com código existente, criamos um proxy que funciona de forma assíncrona
// Mas isso pode causar problemas. Vamos atualizar as funções para usar getStripeInstance() diretamente.

// ============================================
// Types
// ============================================

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring?: {
          interval: string;
          interval_count: number;
        };
      };
    }>;
  };
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method_types: string[];
  metadata?: Record<string, string>;
}

export interface StripePixPayment {
  payment_intent: StripePaymentIntent;
  pix_qr_code?: string;
  pix_copia_e_cola?: string;
  expires_at?: number;
}

// ============================================
// Plan Prices
// ============================================

export const PLAN_PRICES = {
  PROFESSIONAL: {
    monthly: 59700,       // R$597.00 em centavos (cartão recorrente ou PIX mensal)
    yearly: 49700,        // R$497.00/mês no plano anual
    yearlyTotal: 596400,  // R$5.964.00/ano (12x R$497.00)
    yearlySavings: 120000, // Economia de R$1.200.00/ano vs mensal
  },
  ENTERPRISE: {
    monthly: null,      // Customizado
    yearly: null,       // Customizado
    yearlyTotal: null,
    yearlySavings: null,
  },
} as const;

export const EXTRA_PRICES = {
  additionalUser: 9700,    // R$97.00/mês por usuário adicional
  overageRequest: 50,      // R$0,50 por requisição excedente
} as const;

export type PlanId = keyof typeof PLAN_PRICES;

// ============================================
// Customer Methods
// ============================================

export async function createCustomer(data: {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  const stripe = await getStripeInstance();
  return await stripe.customers.create({
    email: data.email,
    name: data.name,
    phone: data.phone,
    metadata: data.metadata,
  });
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer> {
  const stripe = await getStripeInstance();
  return await stripe.customers.retrieve(customerId) as Stripe.Customer;
}

export async function updateCustomer(
  customerId: string,
  data: Partial<{
    email: string;
    name: string;
    phone: string;
    metadata: Record<string, string>;
  }>
): Promise<Stripe.Customer> {
  const stripe = await getStripeInstance();
  return await stripe.customers.update(customerId, data);
}

export async function findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
  const stripe = await getStripeInstance();
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });
  return customers.data[0] || null;
}

// ============================================
// Subscription Methods
// ============================================

export async function createSubscription(data: {
  customerId: string;
  priceId: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  const subscriptionData: Stripe.SubscriptionCreateParams = {
    customer: data.customerId,
    items: [{ price: data.priceId }],
    metadata: data.metadata,
    expand: ["latest_invoice.payment_intent"],
  };

  // Se tiver método de pagamento, usar para pagamento automático
  if (data.paymentMethodId) {
    subscriptionData.default_payment_method = data.paymentMethodId;
  }

  const stripe = await getStripeInstance();
  return await stripe.subscriptions.create(subscriptionData);
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = await getStripeInstance();
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice.payment_intent"],
  });
}

export async function updateSubscription(
  subscriptionId: string,
  data: Partial<{
    priceId: string;
    paymentMethodId: string;
    cancel_at_period_end: boolean;
    metadata: Record<string, string>;
  }>
): Promise<Stripe.Subscription> {
  const updateData: Stripe.SubscriptionUpdateParams = {};

  if (data.priceId) {
    const subscription = await getSubscription(subscriptionId);
    updateData.items = [{
      id: subscription.items.data[0].id,
      price: data.priceId,
    }];
  }

  if (data.paymentMethodId) {
    updateData.default_payment_method = data.paymentMethodId;
  }

  if (data.cancel_at_period_end !== undefined) {
    updateData.cancel_at_period_end = data.cancel_at_period_end;
  }

  if (data.metadata) {
    updateData.metadata = data.metadata;
  }

  const stripe = await getStripeInstance();
  return await stripe.subscriptions.update(subscriptionId, updateData);
}

export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  const stripe = await getStripeInstance();
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

// ============================================
// Payment Methods
// ============================================

export async function createPaymentIntent(data: {
  amount: number;
  currency?: string;
  customerId?: string;
  paymentMethodTypes?: string[];
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const stripe = await getStripeInstance();
  return await stripe.paymentIntents.create({
    amount: data.amount,
    currency: data.currency || "brl",
    customer: data.customerId,
    payment_method_types: data.paymentMethodTypes || ["card", "pix"],
    metadata: data.metadata,
  });
}

export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = await getStripeInstance();
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent> {
  const params: Stripe.PaymentIntentConfirmParams = {};
  
  if (paymentMethodId) {
    params.payment_method = paymentMethodId;
  }

  const stripe = await getStripeInstance();
  return await stripe.paymentIntents.confirm(paymentIntentId, params);
}

// ============================================
// PIX Payment Methods
// ============================================

export async function createPixPayment(data: {
  amount: number;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<StripePixPayment> {
  // Criar PaymentIntent com PIX
  // O Stripe automaticamente gera o QR Code quando payment_method_types inclui "pix"
  const stripe = await getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.amount,
    currency: "brl",
    customer: data.customerId,
    payment_method_types: ["pix"],
    metadata: data.metadata,
  });

  // Para PIX, o QR Code está disponível no next_action após criar o PaymentIntent
  // Não precisamos confirmar imediatamente - o cliente confirma ao pagar
  const nextAction = paymentIntent.next_action;
  const pixData = nextAction?.type === "display_bank_transfer_details"
    ? (nextAction as any).display_bank_transfer_details
    : null;
  
  return {
    payment_intent: paymentIntent,
    pix_qr_code: pixData?.qr_code_data || undefined,
    pix_copia_e_cola: pixData?.hosted_voucher_url || undefined,
    expires_at: pixData?.expires_at ? pixData.expires_at * 1000 : undefined,
  };
}

// ============================================
// Price/Product Methods
// ============================================

export async function createPrice(data: {
  amount: number;
  currency?: string;
  recurring?: {
    interval: "month" | "year";
    interval_count?: number;
  };
  productId?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Price> {
  const priceData: Stripe.PriceCreateParams = {
    unit_amount: data.amount,
    currency: data.currency || "brl",
    metadata: data.metadata,
  };

  if (data.recurring) {
    priceData.recurring = {
      interval: data.recurring.interval,
      interval_count: data.recurring.interval_count || 1,
    };
  } else {
    priceData.product = data.productId || "prod_default";
  }

  const stripe = await getStripeInstance();
  return await stripe.prices.create(priceData);
}

export async function getPrice(priceId: string): Promise<Stripe.Price> {
  const stripe = await getStripeInstance();
  return await stripe.prices.retrieve(priceId);
}

export async function createProduct(data: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Product> {
  const stripe = await getStripeInstance();
  return await stripe.products.create({
    name: data.name,
    description: data.description,
    metadata: data.metadata,
  });
}

export async function findOrCreateProduct(data: {
  name: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Product> {
  // Buscar produto existente por nome
  const stripe = await getStripeInstance();
  const products = await stripe.products.list({
    limit: 100,
  });

  const existing = products.data.find(
    (p) => p.name === data.name && p.active
  );

  if (existing) {
    return existing;
  }

  // Criar novo produto
  return await createProduct(data);
}

/**
 * Sincroniza um plano do banco de dados com o Stripe
 * Cria produto e prices (mensal e anual) se necessário
 */
export async function syncPlanToStripe(data: {
  planId: string;
  name: string;
  description?: string;
  monthlyPrice: number | null; // em R$
  yearlyPrice: number | null; // em R$ por mês
  yearlyTotal: number | null; // em R$ total anual
}): Promise<{
  productId: string;
  monthlyPriceId: string | null;
  yearlyPriceId: string | null;
}> {
  const configured = await isStripeConfigured();
  if (!configured) {
    throw new Error("Stripe não está configurado");
  }

  // Criar ou buscar produto
  const product = await findOrCreateProduct({
    name: data.name,
    description: data.description || undefined,
    metadata: {
      planId: data.planId,
    },
  });

  let monthlyPriceId: string | null = null;
  let yearlyPriceId: string | null = null;

  // Criar price mensal se tiver preço
  if (data.monthlyPrice !== null && data.monthlyPrice > 0) {
    const stripe = await getStripeInstance();
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(data.monthlyPrice * 100), // Converter para centavos
      currency: "brl",
      recurring: {
        interval: "month",
      },
      metadata: {
        planId: data.planId,
        billingCycle: "MONTHLY",
      },
    });
    monthlyPriceId = monthlyPrice.id;
  }

  // Criar price anual se tiver preço
  if (data.yearlyPrice !== null && data.yearlyPrice > 0) {
    const stripe = await getStripeInstance();
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(data.yearlyPrice * 100), // Converter para centavos
      currency: "brl",
      recurring: {
        interval: "year",
      },
      metadata: {
        planId: data.planId,
        billingCycle: "YEARLY",
      },
    });
    yearlyPriceId = yearlyPrice.id;
  }

  return {
    productId: product.id,
    monthlyPriceId,
    yearlyPriceId,
  };
}

// ============================================
// Webhook Verification
// ============================================

export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Promise<Stripe.Event> {
  const stripe = await getStripeInstance();
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

// ============================================
// Test Connection
// ============================================

export async function testConnection(): Promise<boolean> {
  try {
    const isConfigured = await isStripeConfigured();
    if (!isConfigured) {
      return false;
    }
    
    const stripe = await getStripeInstance();
    await stripe.customers.list({ limit: 1 });
    return true;
  } catch {
    return false;
  }
}

