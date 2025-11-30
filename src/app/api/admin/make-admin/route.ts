import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const makeAdminSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = makeAdminSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar role para ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Usuário ${email} agora é um administrador`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erro ao tornar usuário admin:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

