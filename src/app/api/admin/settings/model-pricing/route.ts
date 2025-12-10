import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { DEFAULT_MODEL_PRICING } from "@/lib/model-pricing";
import { z } from "zod";

const pricingSchema = z.record(
  z.string(),
  z.object({
    model: z.string(),
    provider: z.enum(["openai", "anthropic", "google"]),
    inputPrice: z.number().min(0),
    outputPrice: z.number().min(0),
  })
);

/**
 * GET - Busca os preços configurados dos modelos
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

    // Buscar todos os preços configurados
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          startsWith: "model_pricing_",
        },
      },
    });

    const pricing: Record<string, any> = { ...DEFAULT_MODEL_PRICING };

    // Atualizar com valores do banco
    settings.forEach((setting) => {
      try {
        const model = setting.key.replace("model_pricing_", "");
        const value = setting.encrypted ? JSON.parse(setting.value) : JSON.parse(setting.value);
        if (pricing[model]) {
          pricing[model] = {
            ...pricing[model],
            ...value,
          };
        }
      } catch (error) {
        console.error(`Erro ao processar preço para ${setting.key}:`, error);
      }
    });

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("Erro ao buscar preços:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST - Salva os preços dos modelos
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
    const { pricing } = body;

    // Validar
    const validated = pricingSchema.parse(pricing);

    // Salvar cada modelo
    await Promise.all(
      Object.entries(validated).map(async ([model, modelPricing]) => {
        const key = `model_pricing_${model}`;
        const value = JSON.stringify(modelPricing);

        await prisma.systemSettings.upsert({
          where: { key },
          create: {
            key,
            value,
            encrypted: false,
          },
          update: {
            value,
          },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao salvar preços:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

