import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug
 * Endpoint de diagnóstico para verificar problemas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const diagnostics: Record<string, any> = {
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        companyId: session?.user?.companyId || null,
      },
      database: {
        connected: false,
        error: null,
      },
      prisma: {
        notification: false,
        user: false,
        company: false,
      },
    };

    // Testar conexão com banco
    try {
      await prisma.$queryRaw`SELECT 1`;
      diagnostics.database.connected = true;
    } catch (error: any) {
      diagnostics.database.connected = false;
      diagnostics.database.error = error.message;
    }

    // Testar modelos Prisma
    try {
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, email: true, companyId: true },
        });
        diagnostics.prisma.user = !!user;
        
        if (user?.companyId) {
          const company = await prisma.company.findUnique({
            where: { id: user.companyId },
            select: { id: true },
          });
          diagnostics.prisma.company = !!company;
        }
      }
    } catch (error: any) {
      diagnostics.prisma.user = false;
      diagnostics.prisma.error = error.message;
    }

    try {
      if (session?.user?.id) {
        const notifications = await prisma.notification.findMany({
          where: { userId: session.user.id },
          take: 1,
        });
        diagnostics.prisma.notification = true;
      }
    } catch (error: any) {
      diagnostics.prisma.notification = false;
      diagnostics.prisma.notificationError = error.message;
    }

    return NextResponse.json(diagnostics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Erro no diagnóstico",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

