import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    let companyId = session.user.companyId;

    // Buscar companyId se não estiver na sessão
    if (!companyId && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      if (user?.companyId) {
        companyId = user.companyId;
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { companyName, companySize, industry, goals, specificNeeds } = body;

    // Atualizar informações da empresa
    const updateData: any = {};

    if (companyName) {
      updateData.name = companyName;
      // Atualizar slug também
      const slug = companyName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updateData.slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Salvar informações adicionais no settings
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { settings: true },
    });

    const currentSettings = (company?.settings as any) || {};
    const newSettings = {
      ...currentSettings,
      onboarding: {
        companySize,
        industry,
        goals: goals || [],
        specificNeeds: specificNeeds || "",
        completedAt: new Date().toISOString(),
      },
    };

    updateData.settings = newSettings;

    await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Informações do onboarding atualizadas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar informações do onboarding:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

