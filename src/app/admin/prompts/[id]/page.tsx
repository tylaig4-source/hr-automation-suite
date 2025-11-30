import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromptEditor } from "@/components/admin/prompt-editor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminAgentEditPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Buscar role diretamente do banco de dados
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Buscar agente diretamente do banco
    const agent = await prisma.agent.findUnique({
        where: { id: params.id },
    });

    if (!agent) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/prompts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar: {agent.name}</h1>
                    <p className="text-muted-foreground">
                        ID: {agent.id} | Slug: {agent.slug}
                    </p>
                </div>
            </div>

            <PromptEditor agent={agent} />
        </div>
    );
}
