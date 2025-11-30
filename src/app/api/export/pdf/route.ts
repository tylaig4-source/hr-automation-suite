import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { exportToPDF } from "@/lib/export";

const exportSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  content: z.string().min(1),
  agentName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = exportSchema.parse(body);

    const result = await exportToPDF({
      title: data.title,
      subtitle: data.subtitle,
      content: data.content,
      agentName: data.agentName,
      generatedAt: new Date(),
      companyName: undefined, // TODO: pegar da empresa do usuário
    });

    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": result.buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    );
  }
}

