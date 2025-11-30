import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
    title: "Admin - Prompts | SaaS RH",
    description: "Gerenciamento de prompts dos agentes",
};

export default async function AdminPromptsPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const session = await getServerSession(authOptions);

    // Verificação simples de admin (idealmente seria por role)
    if (!session?.user) {
        redirect("/auth/login");
    }

    // Buscar agentes
    const agents = await prisma.agent.findMany({
        where: {
            name: {
                contains: searchParams.q || "",
                mode: "insensitive",
            },
        },
        orderBy: {
            name: "asc",
        },
        include: {
            category: true,
        },
    });

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Prompts</h1>
                    <p className="text-muted-foreground">
                        Edite os prompts de sistema e templates de cada agente.
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2 max-w-md">
                <form className="flex w-full gap-2">
                    <Input
                        name="q"
                        placeholder="Buscar agente..."
                        defaultValue={searchParams.q}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon">
                        <Search className="h-4 w-4" />
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <Card key={agent.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="outline">{agent.category.name}</Badge>
                                {agent.isPremium && <Badge variant="secondary">Premium</Badge>}
                            </div>
                            <CardTitle className="mt-2">{agent.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {agent.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-0">
                            <Button asChild className="w-full">
                                <Link href={`/admin/prompts/${agent.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Prompt
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
