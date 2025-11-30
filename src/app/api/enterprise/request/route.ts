import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa deve ter no mínimo 2 caracteres"),
  contactName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  employees: z.number().int().positive().optional().nullable(),
  currentPlan: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validar dados
    const result = requestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Criar solicitação Enterprise
    const enterpriseRequest = await prisma.enterpriseRequest.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone || null,
        employees: data.employees || null,
        currentPlan: data.currentPlan || null,
        message: data.message || null,
        companyId: session?.user?.companyId || null,
        status: "PENDING",
      },
    });

    // Se o usuário estiver logado, criar notificação
    if (session?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: "Solicitação Enterprise Enviada! 🎉",
          message: "Nossa equipe entrará em contato em breve para criar uma solução personalizada.",
          type: "SUCCESS",
        },
      });
    }

    return NextResponse.json({
      success: true,
      request: enterpriseRequest,
    });
  } catch (error) {
    console.error("Erro ao criar solicitação Enterprise:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

