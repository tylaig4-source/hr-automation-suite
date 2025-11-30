import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Sempre retorna sucesso para não revelar se o email existe
    if (!user) {
      return NextResponse.json({
        message: "Se o e-mail existir, você receberá as instruções.",
      });
    }

    // Gerar token de reset (em produção, salvar no banco e enviar por email)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // TODO: Em produção, salvar token no banco
    // await prisma.passwordReset.create({
    //   data: {
    //     userId: user.id,
    //     token: resetToken,
    //     expiresAt: resetTokenExpiry,
    //   },
    // });

    // TODO: Em produção, enviar email com link de reset
    // await sendEmail({
    //   to: email,
    //   subject: "Redefinir sua senha - HR Suite",
    //   html: `
    //     <p>Você solicitou a redefinição de senha.</p>
    //     <p>Clique no link abaixo para criar uma nova senha:</p>
    //     <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}">
    //       Redefinir Senha
    //     </a>
    //     <p>Este link expira em 1 hora.</p>
    //   `,
    // });

    console.log(`[FORGOT PASSWORD] Token gerado para ${email}: ${resetToken}`);

    return NextResponse.json({
      message: "Se o e-mail existir, você receberá as instruções.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro em forgot-password:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

