"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTemplate } from "./actions";

export function TemplatesList({ templates }: { templates: any[] }) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este template?")) return;

        setDeletingId(id);
        try {
            await deleteTemplate(id);
            router.refresh();
        } catch (error) {
            alert("Erro ao excluir template");
        } finally {
            setDeletingId(null);
        }
    };

    if (templates.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-muted-foreground mb-4">Você ainda não tem templates salvos.</p>
                    <Button asChild>
                        <Link href="/">Explorar Agentes</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
                <Card key={template.id}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {template.description || "Sem descrição"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                            <p>Agente: {template.agent.name}</p>
                            <p>Categoria: {template.agent.category.name}</p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleDelete(template.id)} disabled={deletingId === template.id}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button asChild size="sm">
                                <Link href={`/agents/${template.agent.slug}?template=${template.id}`}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Usar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
