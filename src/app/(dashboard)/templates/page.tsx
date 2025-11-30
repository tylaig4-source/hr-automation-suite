import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TemplatesList } from "./templates-list";

export const metadata: Metadata = {
    title: "Meus Templates | SaaS RH",
    description: "Gerencie seus templates salvos",
};

export default async function TemplatesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/auth/login");
    }

    const templates = await prisma.userTemplate.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            agent: {
                select: {
                    name: true,
                    slug: true,
                    category: {
                        select: {
                            name: true,
                            color: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Meus Templates</h1>
                <p className="text-muted-foreground">
                    Gerencie suas configurações salvas para uso rápido.
                </p>
            </div>

            <TemplatesList templates={templates} />
        </div>
    );
}
