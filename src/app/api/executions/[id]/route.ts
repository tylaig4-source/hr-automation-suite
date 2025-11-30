import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obter detalhes de uma execução
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const execution = await prisma.execution.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!execution) {
      return NextResponse.json(
        { error: "Execução não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ execution });
  } catch (error) {
    console.error("Erro ao buscar execução:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar rating/feedback de uma execução
const updateSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se execução existe e pertence ao usuário
    const existing = await prisma.execution.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Execução não encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const execution = await prisma.execution.update({
      where: { id: params.id },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.feedback !== undefined && { feedback: data.feedback }),
      },
    });

    return NextResponse.json({ execution });
  } catch (error) {
    console.error("Erro ao atualizar execução:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir execução (soft delete ou hard delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se execução existe e pertence ao usuário
    const existing = await prisma.execution.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Execução não encontrada" },
        { status: 404 }
      );
    }

    await prisma.execution.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir execução:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

