import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

/**
 * Busca a chave secreta do Stripe do banco de dados
 */
export async function getStripeSecretKey(): Promise<string | null> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "stripe_secret_key" },
    });

    if (!setting || !setting.value) {
      return null;
    }

    // Se estiver criptografado, descriptografa
    if (setting.encrypted) {
      try {
        return decrypt(setting.value);
      } catch (error) {
        console.error("[Stripe] Erro ao descriptografar chave:", error);
        return null;
      }
    }

    return setting.value;
  } catch (error) {
    console.error("[Stripe] Erro ao buscar chave do banco:", error);
    return null;
  }
}

/**
 * Busca a chave pública do Stripe do banco de dados
 */
export async function getStripePublishableKey(): Promise<string | null> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "stripe_publishable_key" },
    });

    if (!setting || !setting.value) {
      return null;
    }

    // Se estiver criptografado, descriptografa
    if (setting.encrypted) {
      try {
        return decrypt(setting.value);
      } catch (error) {
        console.error("[Stripe] Erro ao descriptografar chave pública:", error);
        return null;
      }
    }

    return setting.value;
  } catch (error) {
    console.error("[Stripe] Erro ao buscar chave pública do banco:", error);
    return null;
  }
}

/**
 * Busca o webhook secret do Stripe do banco de dados
 */
export async function getStripeWebhookSecret(): Promise<string | null> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "stripe_webhook_secret" },
    });

    if (!setting || !setting.value) {
      return null;
    }

    // Se estiver criptografado, descriptografa
    if (setting.encrypted) {
      try {
        return decrypt(setting.value);
      } catch (error) {
        console.error("[Stripe] Erro ao descriptografar webhook secret:", error);
        return null;
      }
    }

    return setting.value;
  } catch (error) {
    console.error("[Stripe] Erro ao buscar webhook secret do banco:", error);
    return null;
  }
}

