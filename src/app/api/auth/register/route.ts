import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// Gera um slug único para a empresa baseado no nome
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-") // Substitui caracteres especiais por hífen
    .replace(/(^-|-$)/g, "") // Remove hífens do início e fim
    + "-" + Date.now().toString(36); // Adiciona timestamp para unicidade
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Verificar se e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar configurações de trial do banco
    const { getTrialSettings } = await import("@/lib/trial-settings");
    const trialSettings = await getTrialSettings();

    // Calcular datas do trial (configurável)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialSettings.trialDays);

    // Criar empresa com trial usando configurações do banco
    const trialCredits = trialSettings.trialCredits;
    const company = await prisma.company.create({
      data: {
        name: `Empresa de ${name.split(" ")[0]}`,
        slug: generateSlug(name),
        plan: "TRIAL",
        maxUsers: 1,
        maxExecutions: trialCredits, // Limite de requisições = créditos
        credits: trialCredits, // 50 créditos para o trial de 3 dias
        isTrialing: true,
        trialStartDate,
        trialEndDate,
      },
    });

    // Criar usuário vinculado à empresa
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "COMPANY_ADMIN", // Admin da empresa
        companyId: company.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
      },
    });

    // Criar notificação de boas-vindas
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Bem-vindo ao HR Suite! 🎉",
        message: `Seu trial de 3 dias começou! Você tem até ${trialEndDate.toLocaleDateString("pt-BR")} para explorar todas as funcionalidades.`,
        type: "SUCCESS",
      },
    });

    return NextResponse.json({
      success: true,
      user,
      trial: {
        startDate: trialStartDate.toISOString(),
        endDate: trialEndDate.toISOString(),
        daysLeft: 3,
        isTrialing: true,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
