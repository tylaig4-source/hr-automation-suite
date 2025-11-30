import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications
// Retorna as notificações do usuário logado
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (!prisma.notification) {
            console.error("CRITICAL: prisma.notification is undefined. Schema might not be synced.");
            return NextResponse.json(
                { error: "Erro interno: Tabela de notificações não encontrada" },
                { status: 500 }
            );
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20, // Limite inicial
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                read: false,
            },
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// PATCH /api/notifications
// Marca notificações como lidas
export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { notificationId, markAllRead } = body;

        if (markAllRead) {
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
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
                    userId: session.user.id,
                },
                data: {
                    read: true,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar notificações:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
