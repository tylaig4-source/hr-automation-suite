import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { invalidateStripeCache } from "@/lib/stripe";
import { z } from "zod";

const stripeSettingsSchema = z.object({
  secretKey: z.string().min(1, "Chave secreta é obrigatória"),
  publishableKey: z.string().min(1, "Chave pública é obrigatória"),
  webhookSecret: z.string().optional(),
});

/**
 * GET - Busca as configurações do Stripe
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 }
      );
    }

    // Buscar configurações
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: ["stripe_secret_key", "stripe_publishable_key", "stripe_webhook_secret"],
        },
      },
    });

    // Formatar resposta (não retorna valores completos por segurança)
    const formatted: Record<string, { configured: boolean; preview?: string }> = {};

    settings.forEach((setting) => {
      if (setting.key === "stripe_secret_key") {
        formatted.secretKey = {
          configured: true,
          preview: setting.value.slice(0, 7) + "..." + setting.value.slice(-4),
        };
      } else if (setting.key === "stripe_publishable_key") {
        formatted.publishableKey = {
          configured: true,
          preview: setting.value.slice(0, 7) + "..." + setting.value.slice(-4),
        };
      } else if (setting.key === "stripe_webhook_secret") {
        formatted.webhookSecret = {
          configured: true,
          preview: setting.value.slice(0, 7) + "..." + setting.value.slice(-4),
        };
      }
    });

    return NextResponse.json({
      success: true,
      settings: {
        secretKey: formatted.secretKey || { configured: false },
        publishableKey: formatted.publishableKey || { configured: false },
        webhookSecret: formatted.webhookSecret || { configured: false },
      },
    });
  } catch (error: any) {
    console.error("[Stripe Settings] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

/**
 * POST/PUT - Salva ou atualiza as configurações do Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { secretKey, publishableKey, webhookSecret } = stripeSettingsSchema.parse(body);

    // Validar chave secreta antes de salvar
    if (secretKey) {
      if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
        return NextResponse.json(
          { error: "Chave secreta inválida. Deve começar com sk_test_ ou sk_live_" },
          { status: 400 }
        );
      }
      
      if (secretKey.length < 50) {
        return NextResponse.json(
          { error: `Chave secreta muito curta (${secretKey.length} caracteres). Verifique se copiou a chave completa do Stripe Dashboard.` },
          { status: 400 }
        );
      }
      
      console.log(`[Stripe Settings API] Salvando chave secreta (tamanho: ${secretKey.length})`);
    }

    // Criptografar valores
    const encryptedSecretKey = secretKey ? encrypt(secretKey) : null;
    const encryptedPublishableKey = publishableKey ? encrypt(publishableKey) : null;
    const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : null;

    // Salvar ou atualizar usando upsert
    if (encryptedSecretKey) {
      await prisma.systemSettings.upsert({
        where: { key: "stripe_secret_key" },
        create: {
          key: "stripe_secret_key",
          value: encryptedSecretKey,
          encrypted: true,
        },
        update: {
          value: encryptedSecretKey,
          encrypted: true,
        },
      });
    }

    if (encryptedPublishableKey) {
      await prisma.systemSettings.upsert({
        where: { key: "stripe_publishable_key" },
        create: {
          key: "stripe_publishable_key",
          value: encryptedPublishableKey,
          encrypted: true,
        },
        update: {
          value: encryptedPublishableKey,
          encrypted: true,
        },
      });
    }

    if (encryptedWebhookSecret) {
      await prisma.systemSettings.upsert({
        where: { key: "stripe_webhook_secret" },
        create: {
          key: "stripe_webhook_secret",
          value: encryptedWebhookSecret,
          encrypted: true,
        },
        update: {
          value: encryptedWebhookSecret,
          encrypted: true,
        },
      });
    }

    // Invalidar cache do Stripe (forçar recriação da instância)
    invalidateStripeCache();

    return NextResponse.json({
      success: true,
      message: "Configurações do Stripe salvas com sucesso!",
    });
  } catch (error: any) {
    console.error("[Stripe Settings] Erro:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}

