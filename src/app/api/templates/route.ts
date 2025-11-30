import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Schema de criação
const createTemplateSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  description: z.string().optional(),
  inputs: z.record(z.string(), z.any()),
});

// GET - Listar templates do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    const where: any = { userId: session.user.id };
    if (agentId) {
      where.agentId = agentId;
    }

    const templates = await prisma.userTemplate.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Erro ao listar templates:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = createTemplateSchema.parse(body);

    // Verificar se agente existe
    const agent = await prisma.agent.findUnique({
      where: { id: data.agentId },
    });

    if (!agent) {
      // Tenta buscar por slug
      const agentBySlug = await prisma.agent.findUnique({
        where: { slug: data.agentId },
      });

      if (!agentBySlug) {
        return NextResponse.json(
          { error: "Agente não encontrado" },
          { status: 404 }
        );
      }

      data.agentId = agentBySlug.id;
    }

    // Verificar limite de templates (ex: 50 por usuário)
    const count = await prisma.userTemplate.count({
      where: { userId: session.user.id },
    });

    if (count >= 50) {
      return NextResponse.json(
        { error: "Limite de 50 templates atingido" },
        { status: 400 }
      );
    }

    const template = await prisma.userTemplate.create({
      data: {
        userId: session.user.id,
        agentId: data.agentId,
        name: data.name,
        description: data.description,
        inputs: data.inputs,
        isDefault: false,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar template:", error);

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

