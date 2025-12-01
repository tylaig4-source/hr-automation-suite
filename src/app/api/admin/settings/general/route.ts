import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const generalSettingsSchema = z.object({
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

    // Buscar configuração
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "allow_trial_without_card" },
    });

    const allowTrialWithoutCard = setting 
      ? setting.value === "true" 
      : true; // Default

    return NextResponse.json({ allowTrialWithoutCard });
  } catch (error: any) {
    console.error("Erro ao buscar configurações gerais:", error);
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
    const validatedData = generalSettingsSchema.parse(body);

    // Salvar configuração
    await prisma.systemSettings.upsert({
      where: { key: "allow_trial_without_card" },
      create: { 
        key: "allow_trial_without_card", 
        value: validatedData.allowTrialWithoutCard.toString(), 
        encrypted: false 
      },
      update: { 
        value: validatedData.allowTrialWithoutCard.toString(), 
        encrypted: false 
      },
    });

    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao salvar configurações gerais:", error);

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

