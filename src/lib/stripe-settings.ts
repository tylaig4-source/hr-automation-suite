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
      console.log("[Stripe Settings] Nenhuma chave secreta encontrada no banco");
      return null;
    }

    let decryptedKey: string;

    // Se estiver criptografado, descriptografa
    if (setting.encrypted) {
      try {
        decryptedKey = decrypt(setting.value);
        console.log(`[Stripe Settings] Chave descriptografada (tamanho: ${decryptedKey.length})`);
      } catch (error: any) {
        console.error("[Stripe Settings] Erro ao descriptografar chave:", error);
        console.error("[Stripe Settings] Possível causa: ENCRYPTION_KEY mudou ou não está configurada corretamente.");
        console.error("[Stripe Settings] Solução: Reconfigure as chaves do Stripe em /admin/settings");
        return null;
      }
    } else {
      decryptedKey = setting.value;
      console.log(`[Stripe Settings] Chave não criptografada (tamanho: ${decryptedKey.length})`);
    }

    // Validar formato básico
    if (!decryptedKey.startsWith("sk_test_") && !decryptedKey.startsWith("sk_live_")) {
      console.error(`[Stripe Settings] ERRO: Chave não começa com sk_test_ ou sk_live_`);
      console.error(`[Stripe Settings] Primeiros caracteres: ${decryptedKey.substring(0, 20)}`);
      console.error(`[Stripe Settings] Tamanho total: ${decryptedKey.length} caracteres`);
      // Não retornar chave inválida - deixar que o erro seja tratado em getStripe()
      return null;
    }

    if (decryptedKey.length < 50) {
      console.error(`[Stripe Settings] ERRO: Chave muito curta (${decryptedKey.length} caracteres)`);
      console.error(`[Stripe Settings] Chaves do Stripe geralmente têm 100+ caracteres`);
      // Não retornar chave inválida
      return null;
    }

    console.log(`[Stripe Settings] Chave válida encontrada (${decryptedKey.length} caracteres)`);
    return decryptedKey;
  } catch (error) {
    console.error("[Stripe Settings] Erro ao buscar chave do banco:", error);
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
      } catch (error: any) {
        console.error("[Stripe Settings] Erro ao descriptografar chave pública:", error);
        console.error("[Stripe Settings] Possível causa: ENCRYPTION_KEY mudou ou não está configurada corretamente.");
        console.error("[Stripe Settings] Solução: Reconfigure as chaves do Stripe em /admin/settings");
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
      } catch (error: any) {
        console.error("[Stripe Settings] Erro ao descriptografar webhook secret:", error);
        console.error("[Stripe Settings] Possível causa: ENCRYPTION_KEY mudou ou não está configurada corretamente.");
        console.error("[Stripe Settings] Solução: Reconfigure as chaves do Stripe em /admin/settings");
        return null;
      }
    }

    return setting.value;
  } catch (error) {
    console.error("[Stripe] Erro ao buscar webhook secret do banco:", error);
    return null;
  }
}

