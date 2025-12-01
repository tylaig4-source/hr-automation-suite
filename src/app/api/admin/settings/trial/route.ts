import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const trialSettingsSchema = z.object({
  trialDays: z.number().min(1).max(365),
  trialCredits: z.number().min(1),
  allowTrialWithoutCard: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar configurações do banco
    const getSetting = async (key: string, defaultValue: any) => {
      const setting = await prisma.systemSettings.findUnique({
        where: { key },
      });
      if (!setting) return defaultValue;
      
      // Para booleanos, converter string
      if (typeof defaultValue === "boolean") {
        return setting.value === "true";
      }
      // Para números, converter string
      if (typeof defaultValue === "number") {
        return parseInt(setting.value) || defaultValue;
      }
      return setting.value;
    };

    const settings = {
      trialDays: await getSetting("trial_days", 3),
      trialCredits: await getSetting("trial_credits", 50),
      allowTrialWithoutCard: await getSetting("allow_trial_without_card", true),
    };

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Erro ao buscar configurações de trial:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = trialSettingsSchema.parse(body);

    // Salvar cada configuração
    await prisma.systemSettings.upsert({
      where: { key: "trial_days" },
      create: { key: "trial_days", value: validatedData.trialDays.toString(), encrypted: false },
      update: { value: validatedData.trialDays.toString(), encrypted: false },
    });

    await prisma.systemSettings.upsert({
      where: { key: "trial_credits" },
      create: { key: "trial_credits", value: validatedData.trialCredits.toString(), encrypted: false },
      update: { value: validatedData.trialCredits.toString(), encrypted: false },
    });

    await prisma.systemSettings.upsert({
      where: { key: "allow_trial_without_card" },
      create: { key: "allow_trial_without_card", value: validatedData.allowTrialWithoutCard.toString(), encrypted: false },
      update: { value: validatedData.allowTrialWithoutCard.toString(), encrypted: false },
    });

    return NextResponse.json({
      success: true,
      message: "Configurações de trial salvas com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao salvar configurações de trial:", error);

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

