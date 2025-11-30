import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "IN_PROGRESS", "APPROVED", "REJECTED", "CLOSED"]),
  notes: z.string().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { status, notes } = result.data;

    const updated = await prisma.enterpriseRequest.update({
      where: { id: params.id },
      data: {
        status,
        notes: notes || null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      request: updated,
    });
  } catch (error) {
    console.error("Erro ao atualizar solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

