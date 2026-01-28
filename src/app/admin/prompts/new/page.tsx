import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreateAgentForm } from "@/components/admin/prompts/create-agent-form";

export const metadata: Metadata = {
    title: "Novo Agente | Admin SaaS RH",
    description: "Criar novo agente de IA",
};

export default async function NewAgentPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });

    return (
        <div className="container mx-auto py-10">
            <CreateAgentForm categories={categories} />
        </div>
    );
}
