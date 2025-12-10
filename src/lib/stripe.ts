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
    // Tenta buscar do banco primeiro (prioridade)
    const dbKey = await getStripeSecretKey();
    
    // Fallback para env (para compatibilidade)
    const envKey = process.env.STRIPE_SECRET_KEY;
    
    const secretKey = dbKey || envKey;
    const keySource = dbKey ? "banco de dados" : (envKey ? "variável de ambiente" : "nenhuma");
    
    // Log para debug (não mostra a chave completa por segurança)
    if (secretKey) {
      const keyPreview = secretKey.substring(0, 12) + "..." + secretKey.substring(secretKey.length - 4);
      console.log(`[Stripe] Usando chave do ${keySource}: ${keyPreview} (tamanho: ${secretKey.length})`);
      
      // Validar formato básico da chave
      if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
        console.error(`[Stripe] ERRO: Chave não começa com sk_test_ ou sk_live_`);
        console.error(`[Stripe] Primeiros caracteres: ${secretKey.substring(0, 20)}`);
        throw new Error(
          "Chave do Stripe inválida. A chave deve começar com 'sk_test_' ou 'sk_live_'. Verifique a configuração em /admin/settings"
        );
      }
      
      if (secretKey.length < 50) {
        console.error(`[Stripe] ERRO: Chave muito curta (${secretKey.length} caracteres). Chaves do Stripe geralmente têm 100+ caracteres.`);
        throw new Error(
          "Chave do Stripe inválida. A chave parece estar incompleta. Verifique a configuração em /admin/settings"
        );
      }
    } else {
      // Verificar se estamos em fase de build
      const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build" || 
                          process.env.NEXT_PHASE === "phase-development-build" ||
                          process.env.NODE_ENV === "test";
      
      if (isBuildPhase) {
        // Durante o build, usar chave dummy para não quebrar
        console.warn("[Stripe] Build phase detectada - usando chave dummy temporária");
        stripeSecretKey = "sk_test_dummy";
        stripeInstance = new Stripe("sk_test_dummy", {
          apiVersion: "2025-11-17.clover",
          typescript: true,
        });
        return stripeInstance;
      }
      
      // Em runtime, não usar chave dummy - lançar erro claro
      console.error("[Stripe] ERRO: Nenhuma chave encontrada no banco de dados ou variáveis de ambiente");
      console.error("[Stripe] Configure as chaves do Stripe em /admin/settings");
      throw new Error(
        "Stripe não está configurado. Configure as chaves do Stripe em /admin/settings ou defina STRIPE_SECRET_KEY no .env"
      );
    }
    
    // Usar a chave encontrada
    stripeSecretKey = secretKey;
    
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Helper para verificar se Stripe está configurado
export async function isStripeConfigured(): Promise<boolean> {
  try {
    const dbKey = await getStripeSecretKey();
    const envKey = process.env.STRIPE_SECRET_KEY;
    
    const secretKey = dbKey || envKey;
    
    // Verificar se a chave existe e é válida
    if (!secretKey) {
      return false;
    }
    
    // Verificar se não é chave dummy
    if (secretKey === "sk_test_dummy") {
      return false;
    }
    
    // Verificar formato básico
    if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
      return false;
    }
    
    // Verificar tamanho mínimo
    if (secretKey.length < 50) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[Stripe] Erro ao verificar configuração:", error);
    return false;
  }
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
  trialPeriodDays?: number; // Período de trial em dias (ex: 7 dias)
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

  // Se tiver período de trial, adicionar
  if (data.trialPeriodDays && data.trialPeriodDays > 0) {
    subscriptionData.trial_period_days = data.trialPeriodDays;
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

/**
 * Cria um PaymentMethod com os dados do cartão
 */
export async function createPaymentMethod(data: {
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}): Promise<Stripe.PaymentMethod> {
  const stripe = await getStripeInstance();
  return await stripe.paymentMethods.create({
    type: "card",
    card: {
      number: data.card.number.replace(/\s/g, ""), // Remove espaços
      exp_month: data.card.exp_month,
      exp_year: data.card.exp_year,
      cvc: data.card.cvc,
    },
    billing_details: data.billing_details,
  });
}

/**
 * Anexa um PaymentMethod a um Customer
 */
export async function attachPaymentMethodToCustomer(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  const stripe = await getStripeInstance();
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
}

/**
 * Define um PaymentMethod como padrão para um Customer
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> {
  const stripe = await getStripeInstance();
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
}

/**
 * Cria e anexa um PaymentMethod a um Customer em uma única operação
 */
export async function createAndAttachPaymentMethod(data: {
  customerId: string;
  card: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  billing_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  setAsDefault?: boolean;
}): Promise<Stripe.PaymentMethod> {
  // Criar PaymentMethod
  const paymentMethod = await createPaymentMethod({
    card: data.card,
    billing_details: data.billing_details,
  });

  // Anexar ao Customer
  await attachPaymentMethodToCustomer(paymentMethod.id, data.customerId);

  // Definir como padrão se solicitado
  if (data.setAsDefault) {
    await setDefaultPaymentMethod(data.customerId, paymentMethod.id);
  }

  return paymentMethod;
}

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

  // Para PIX, precisamos confirmar o PaymentIntent para obter o QR Code
  // O QR Code está disponível no next_action após confirmar
  let confirmedPaymentIntent = paymentIntent;
  
  // Se o PaymentIntent não estiver confirmado, tentar confirmar
  if (paymentIntent.status === "requires_payment_method") {
    try {
      confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
    } catch (error) {
      console.error("Erro ao confirmar PaymentIntent PIX:", error);
    }
  }
  
  const nextAction = confirmedPaymentIntent.next_action;
  const pixData = nextAction?.type === "display_bank_transfer_details"
    ? (nextAction as any).display_bank_transfer_details
    : null;
  
  return {
    payment_intent: confirmedPaymentIntent,
    pix_qr_code: pixData?.qr_code_data || undefined,
    pix_copia_e_cola: pixData?.hosted_voucher_url || pixData?.qr_code_data || undefined,
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
  console.log(`[syncPlanToStripe] Iniciando sincronização para plano: ${data.planId}`);
  
  const configured = await isStripeConfigured();
  if (!configured) {
    console.error("[syncPlanToStripe] Stripe não está configurado");
    throw new Error("Stripe não está configurado. Configure as chaves em /admin/settings");
  }

  // Verificar chave antes de usar
  const secretKey = await getStripeSecretKey();
  if (!secretKey) {
    throw new Error("Chave secreta do Stripe não encontrada no banco de dados");
  }
  
  if (secretKey.length < 50) {
    throw new Error(`Chave secreta do Stripe parece estar incompleta (${secretKey.length} caracteres). Verifique se a chave foi salva corretamente em /admin/settings.`);
  }
  
  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error(`Chave secreta do Stripe inválida. Deve começar com sk_test_ ou sk_live_. Primeiros caracteres: ${secretKey.substring(0, 20)}`);
  }

  console.log(`[syncPlanToStripe] Stripe configurado, criando/buscando produto: ${data.name}`);
  
  // Criar ou buscar produto
  let product: Stripe.Product;
  try {
    product = await findOrCreateProduct({
      name: data.name,
      description: data.description || undefined,
      metadata: {
        planId: data.planId,
      },
    });
    console.log(`[syncPlanToStripe] Produto encontrado/criado: ${product.id}`);
  } catch (error: any) {
    console.error(`[syncPlanToStripe] Erro ao criar/buscar produto:`, error);
    throw new Error(`Erro ao criar produto no Stripe: ${error.message}`);
  }

  let monthlyPriceId: string | null = null;
  let yearlyPriceId: string | null = null;

  // Criar price mensal se tiver preço
  if (data.monthlyPrice !== null && data.monthlyPrice > 0) {
    try {
      console.log(`[syncPlanToStripe] Criando price mensal: R$ ${data.monthlyPrice}`);
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
      console.log(`[syncPlanToStripe] Price mensal criado: ${monthlyPriceId}`);
    } catch (error: any) {
      console.error(`[syncPlanToStripe] Erro ao criar price mensal:`, error);
      throw new Error(`Erro ao criar price mensal: ${error.message}`);
    }
  } else if (data.monthlyPrice === null) {
    console.log(`[syncPlanToStripe] Price mensal não configurado para ${data.planId} (pode ser Enterprise customizado)`);
  }

  // Criar price anual se tiver preço
  if (data.yearlyPrice !== null && data.yearlyPrice > 0) {
    try {
      console.log(`[syncPlanToStripe] Criando price anual: R$ ${data.yearlyPrice}/mês`);
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
      console.log(`[syncPlanToStripe] Price anual criado: ${yearlyPriceId}`);
    } catch (error: any) {
      console.error(`[syncPlanToStripe] Erro ao criar price anual:`, error);
      throw new Error(`Erro ao criar price anual: ${error.message}`);
    }
  } else if (data.yearlyPrice === null) {
    console.log(`[syncPlanToStripe] Price anual não configurado para ${data.planId} (pode ser Enterprise customizado)`);
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

