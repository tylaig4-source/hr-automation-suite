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

    // Criar empresa SEM plano ativo - usuário deve escolher no onboarding
    // Não atribuir trial automaticamente, nem créditos
    const company = await prisma.company.create({
      data: {
        name: `Empresa de ${name.split(" ")[0]}`,
        slug: generateSlug(name),
        plan: "TRIAL", // Apenas para referência, mas isTrialing = false
        maxUsers: 0, // Sem acesso até escolher plano
        maxExecutions: 0, // Sem acesso até escolher plano
        credits: 0, // Sem créditos até escolher plano
        isTrialing: false, // Não está em trial até escolher
        trialStartDate: null,
        trialEndDate: null,
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
        message: "Complete o onboarding para escolher seu plano e começar a usar a plataforma.",
        type: "INFO",
      },
    });

    return NextResponse.json({
      success: true,
      user,
      requiresOnboarding: true, // Indica que precisa escolher plano
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
