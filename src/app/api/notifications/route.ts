import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/notifications
// Retorna as notificações do usuário logado
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20, // Limite inicial
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: userId,
                read: false,
            },
        });

        return NextResponse.json({ 
            notifications: notifications || [], 
            unreadCount: unreadCount || 0 
        });
    } catch (error: any) {
        console.error("Erro ao buscar notificações:", error);
        console.error("Stack trace:", error?.stack);
        return NextResponse.json(
            { 
                error: "Erro interno do servidor",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications
// Marca notificações como lidas
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { notificationId, markAllRead } = body;

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: userId,
                    read: false,
                },
                data: {
                    read: true,
                },
            });
        } else if (notificationId) {
            await prisma.notification.update({
                where: {
                    id: notificationId,
                    userId: userId,
                },
                data: {
                    read: true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erro ao atualizar notificações:", error);
        console.error("Stack trace:", error?.stack);
        return NextResponse.json(
            { 
                error: "Erro interno do servidor",
                details: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
